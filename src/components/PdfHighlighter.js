import React, { PureComponent } from "react";
import ReactDom from "react-dom";
import Pointable from "react-pointable";
import _ from "lodash/fp";
import {
  PDFViewer,
  PDFLinkService,
  PDFFindController,
  getGlobalEventBus,
} from "pdfjs-dist/web/pdf_viewer";
import "pdfjs-dist/web/pdf_viewer.css";
import "../style/pdf_viewer.css";
import "../style/PdfHighlighter.css";
import getBoundingRect from "../lib/get-bounding-rect";
import getClientRects from "../lib/get-client-rects";
import getAreaAsPng from "../lib/get-area-as-png";
import {
  getPageFromRange,
  getPageFromElement,
  findOrCreateContainerLayer,
} from "../lib/pdfjs-dom";
import TipContainer from "./TipContainer";
import MouseSelection from "./MouseSelection";
import { scaledToViewport, viewportToScaled } from "../lib/coordinates";
const EMPTY_ID = "empty-id";

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

class PdfHighlighter extends PureComponent {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      ghostHighlight: null,
      isCollapsed: true,
      range: null,
      scrolledToHighlightId: EMPTY_ID,
      isAreaSelectionInProgress: false,
      tip: null,
    });

    _defineProperty(this, "viewer", void 0);

    _defineProperty(this, "linkService", void 0);

    _defineProperty(this, "containerNode", null);

    _defineProperty(this, "debouncedAfterSelection", void 0);

    _defineProperty(this, "hideTipAndSelection", () => {
      const tipNode = findOrCreateContainerLayer(
        this.viewer.viewer,
        "PdfHighlighter__tip-layer"
      );
      ReactDom.unmountComponentAtNode(tipNode);
      this.setState(
        {
          ghostHighlight: null,
          tip: null,
        },
        () => this.renderHighlights()
      );
    });

    _defineProperty(this, "onTextLayerRendered", () => {
      this.renderHighlights();
    });

    _defineProperty(this, "scrollTo", (highlight) => {
      const { pageNumber, boundingRect, usePdfCoordinates } =
        highlight.position;
      this.viewer.container.removeEventListener("scroll", this.onScroll);
      const pageViewport = this.viewer.getPageView(pageNumber - 1).viewport;
      const scrollMargin = 10;
      this.viewer.scrollPageIntoView({
        pageNumber,
        destArray: [
          null,
          {
            name: "XYZ",
          },
          ...pageViewport.convertToPdfPoint(
            0,
            scaledToViewport(boundingRect, pageViewport, usePdfCoordinates)
              .top - scrollMargin
          ),
          0,
        ],
      });
      this.setState(
        {
          scrolledToHighlightId: highlight.id,
        },
        () => this.renderHighlights()
      ); // wait for scrolling to finish

      setTimeout(() => {
        this.viewer.container.addEventListener("scroll", this.onScroll);
      }, 100);
    });

    _defineProperty(this, "onDocumentReady", () => {
      this.getT();

      const { scrollRef } = this.props;
      this.viewer.currentScaleValue = "auto";
      scrollRef(this.scrollTo);
    });

    _defineProperty(this, "onSelectionChange", () => {
      const selection = window.getSelection();

      if (selection.isCollapsed) {
        this.setState({
          isCollapsed: true,
        });
        return;
      }

      const range = selection.getRangeAt(0);

      if (!range) {
        return;
      }

      this.setState({
        isCollapsed: false,
        range,
      });
      this.debouncedAfterSelection();
    });

    _defineProperty(this, "onScroll", () => {
      const { onScrollChange } = this.props;
      onScrollChange();
      this.setState(
        {
          scrolledToHighlightId: EMPTY_ID,
        },
        () => this.renderHighlights()
      );
      this.viewer.container.removeEventListener("scroll", this.onScroll);
    });

    _defineProperty(this, "onMouseDown", (event) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }

      if (event.target.closest(".PdfHighlighter__tip-container")) {
        return;
      }

      this.hideTipAndSelection();
    });

    _defineProperty(this, "handleKeyDown", (event) => {
      if (event.code === "Escape") {
        this.hideTipAndSelection();
      }
    });

    _defineProperty(this, "afterSelection", () => {
      console.log("after selection");
      const { onSelectionFinished } = this.props;
      const { isCollapsed, range } = this.state;

      if (!range || isCollapsed) {
        return;
      }

      const page = getPageFromRange(range);

      if (!page) {
        return;
      }

      const rects = getClientRects(range, page.node);

      if (rects.length === 0) {
        return;
      }

      const boundingRect = getBoundingRect(rects);
      const viewportPosition = {
        boundingRect,
        rects,
        pageNumber: page.number,
      };
      console.log(viewportPosition);
      const content = {
        text: range.toString(),
      };
      const scaledPosition = this.viewportPositionToScaled(viewportPosition);
      this.renderTipAtPosition(
        viewportPosition,
        onSelectionFinished(
          scaledPosition,
          content,
          () => this.hideTipAndSelection(),
          () =>
            this.setState(
              {
                ghostHighlight: {
                  position: scaledPosition,
                },
              },
              () => this.renderHighlights()
            )
        )
      );
    });
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pdfDocument !== this.props.pdfDocument) {
      this.init();
      return;
    }

    //if (prevProps.highlights !== this.props.highlights) {
    this.renderHighlights(this.props);
    //}
  }

  init() {
    const { pdfDocument } = this.props;
    this.debouncedAfterSelection = _.debounce(500, this.afterSelection);
    this.linkService = new PDFLinkService();
    this.pdfFindController = new PDFFindController({
      linkService: this.linkService,
    });
    this.viewer = new PDFViewer({
      container: this.containerNode,
      enhanceTextSelection: true,
      removePageBorders: true,
      linkService: this.linkService,
      findController: this.pdfFindController,
    });
    this.viewer.setDocument(pdfDocument);
    this.linkService.setDocument(pdfDocument);
    this.linkService.setViewer(this.viewer); // debug

    window.PdfViewer = this;
    document.addEventListener("selectionchange", this.onSelectionChange);
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("pagesinit", () => {
      this.onDocumentReady();
    });
    document.addEventListener("textlayerrendered", this.onTextLayerRendered);
  }

  componentWillUnmount() {
    document.removeEventListener("selectionchange", this.onSelectionChange);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("textlayerrendered", this.onTextLayerRendered);
  }

  findOrCreateHighlightLayer(page) {
    const textLayer = this.viewer.getPageView(page - 1).textLayer;

    if (!textLayer) {
      return null;
    }

    return findOrCreateContainerLayer(
      textLayer.textLayerDiv,
      "PdfHighlighter__highlight-layer"
    );
  }

  groupHighlightsByPage(highlights) {
    const { ghostHighlight } = this.state;
    return [...highlights, ghostHighlight]
      .filter(Boolean)
      .reduce((res, highlight) => {
        const { pageNumber } = highlight.position;
        res[pageNumber] = res[pageNumber] || [];
        res[pageNumber].push(highlight);
        return res;
      }, {});
  }

  showTip(highlight, content) {
    const { isCollapsed, ghostHighlight, isAreaSelectionInProgress } =
      this.state;
    const highlightInProgress = !isCollapsed || ghostHighlight;

    if (highlightInProgress || isAreaSelectionInProgress) {
      return;
    }

    this.renderTipAtPosition(highlight.position, content);
  }

  scaledPositionToViewport({
    pageNumber,
    boundingRect,
    rects,
    usePdfCoordinates,
  }) {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;
    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map((rect) =>
        scaledToViewport(rect, viewport, usePdfCoordinates)
      ),
      pageNumber,
    };
  }

  viewportPositionToScaled({ pageNumber, boundingRect, rects }) {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;
    return {
      boundingRect: viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map((rect) => viewportToScaled(rect, viewport)),
      pageNumber,
    };
  }

  screenshot(position, pageNumber) {
    const canvas = this.viewer.getPageView(pageNumber - 1).canvas;
    return getAreaAsPng(canvas, position);
  }

  renderHighlights(nextProps) {
    const { highlightTransform, highlights } = nextProps || this.props;
    const { pdfDocument } = this.props;
    const { tip, scrolledToHighlightId } = this.state;
    const highlightsByPage = this.groupHighlightsByPage(highlights);

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const highlightLayer = this.findOrCreateHighlightLayer(pageNumber);

      if (highlightLayer) {
        ReactDom.render(
          React.createElement(
            "div",
            null,
            (highlightsByPage[String(pageNumber)] || []).map(
              (highlight, index) => {
                const { position, ...rest } = highlight;
                const viewportHighlight = {
                  position: this.scaledPositionToViewport(position),
                  ...rest,
                };

                if (tip && tip.highlight.id === String(highlight.id)) {
                  this.showTip(tip.highlight, tip.callback(viewportHighlight));
                }

                const isScrolledTo = Boolean(
                  scrolledToHighlightId === highlight.id
                );
                return highlightTransform(
                  viewportHighlight,
                  index,
                  (highlight, callback) => {
                    this.setState({
                      tip: {
                        highlight,
                        callback,
                      },
                    });
                    this.showTip(highlight, callback(highlight));
                  },
                  this.hideTipAndSelection,
                  (rect) => {
                    const viewport = this.viewer.getPageView(
                      pageNumber - 1
                    ).viewport;
                    return viewportToScaled(rect, viewport);
                  },
                  (boundingRect) => this.screenshot(boundingRect, pageNumber),
                  isScrolledTo
                );
              }
            )
          ),
          highlightLayer
        );
      }
    }
  }

  renderTipAtPosition(position, inner) {
    const { boundingRect, pageNumber } = position;
    const page = {
      node: this.viewer.getPageView(pageNumber - 1).div,
    };
    const pageBoundingRect = page.node.getBoundingClientRect();
    const tipNode = findOrCreateContainerLayer(
      this.viewer.viewer,
      "PdfHighlighter__tip-layer"
    );
    ReactDom.render(
      React.createElement(TipContainer, {
        scrollTop: this.viewer.container.scrollTop,
        pageBoundingRect: pageBoundingRect,
        style: {
          left:
            page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
          top: boundingRect.top + page.node.offsetTop,
          bottom: boundingRect.top + page.node.offsetTop + boundingRect.height,
        },
        children: inner,
      }),
      tipNode
    );
  }

  toggleTextSelection(flag) {
    this.viewer.viewer.classList.toggle(
      "PdfHighlighter--disable-selection",
      flag
    );
  }
  async getT() {
    const { pdfDocument } = this.props;

    var plaintext = "";
    for (var pn = 1; pn <= pdfDocument.numPages; pn++) {
      var page = await pdfDocument.getPage(pn);
      var unscaledViewport = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: 1.649169176049577 });
      var textContent = await page.getTextContent({
        normalizeWhitespace: true,
      });
      textContent.items.forEach(function (textItem) {
        let tolerance = 10;
        let x = textItem.transform[4] - tolerance / 2;
        let y = textItem.transform[5] - tolerance / 2;
        let w = textItem.width + tolerance;
        let h = textItem.height + tolerance;

        const [x1, y1, x2, y2] = vp.convertToViewportRectangle([
          x,
          y,
          w + x,
          h + y,
        ]);
        plaintext += textItem.str;
      });
    }
  }
  render() {
    const { onSelectionFinished, enableAreaSelection } = this.props;
    return React.createElement(
      Pointable,
      {
        onPointerDown: this.onMouseDown,
      },
      React.createElement(
        "div",
        {
          ref: (node) => (this.containerNode = node),
          className: "PdfHighlighter",
          onContextMenu: (e) => e.preventDefault(),
        },
        React.createElement("div", {
          className: "pdfViewer",
        }),
        typeof enableAreaSelection === "function"
          ? React.createElement(MouseSelection, {
              onDragStart: () => this.toggleTextSelection(true),
              onDragEnd: () => this.toggleTextSelection(false),
              onChange: (isVisible) =>
                this.setState({
                  isAreaSelectionInProgress: isVisible,
                }),
              shouldStart: (event) =>
                enableAreaSelection(event) &&
                event.target instanceof HTMLElement &&
                Boolean(event.target.closest(".page")),
              onSelection: (startTarget, boundingRect, resetSelection) => {
                const page = getPageFromElement(startTarget);

                if (!page) {
                  return;
                }

                const pageBoundingRect = {
                  ...boundingRect,
                  top: boundingRect.top - page.node.offsetTop,
                  left: boundingRect.left - page.node.offsetLeft,
                };
                const viewportPosition = {
                  boundingRect: pageBoundingRect,
                  rects: [],
                  pageNumber: page.number,
                };
                const scaledPosition =
                  this.viewportPositionToScaled(viewportPosition);
                const image = this.screenshot(pageBoundingRect, page.number);
                this.renderTipAtPosition(
                  viewportPosition,
                  onSelectionFinished(
                    scaledPosition,
                    {
                      image,
                    },
                    () => this.hideTipAndSelection(),
                    () =>
                      this.setState(
                        {
                          ghostHighlight: {
                            position: scaledPosition,
                            content: {
                              image,
                            },
                          },
                        },
                        () => {
                          resetSelection();
                          this.renderHighlights();
                        }
                      )
                  )
                );
              },
            })
          : null
      )
    );
  }
}

export default PdfHighlighter;
