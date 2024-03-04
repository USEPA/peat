// @flow

import React, { Component, useState } from "react";
import URLSearchParams from "url-search-params";
import PdfHighlighter from "./components/PdfHighlighter";
import Tip from "./components/Tip";
import Highlight from "./components/Highlight";
import Popup from "./components/Popup";
import AreaHighlight from "./components/AreaHighlight";
import PdfLoader from "./components/PdfLoader";
import defaultTags from "./tags.json";
import testHighlights from "./test-highlights.js";
import pdfjs from "pdfjs-dist";
import Spinner from "./Spinner.js";
import Sidebar from "./Sidebar.js";
import $ from "jquery";
import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer.js";
require("split.js");
import Split from "split.js";

import type {
  T_Highlight,
  T_NewHighlight,
} from "react-pdf-highlighter/src/types";

import "./style/App.css";
require("popper.js");
require("bootstrap");
require("@eastdesire/jscolor");
import "./lib/bootstrap/css/bootstrap.min.css";

type T_ManuscriptHighlight = T_Highlight;

type Props = {};

type State = {
  highlights: Array<T_ManuscriptHighlight>,
  selectedRelation: "",
};

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};
let firstLoad = true;
const HighlightPopup = ({ comment }) =>
  comment.text ? <div className="Highlight__popup">{comment.text}</div> : null;

const DEFAULT_URL = "./AdobePDF.pdf";
let cur_highlgiht_id = 0;

function addTagsToFinder(data) {
  //Create and append select list
  var selectList = document.getElementById("entities");
  if (selectList != null) {
    var selectedIndex = $("#entities")[0].selectedIndex;
    //Create and append the options
    $("#entities").empty();
    for (var i = 0; i < data.length; i++) {
      var option = document.createElement("option");
      option.value = data[i].name;
      option.text = data[i].name;
      selectList.appendChild(option);
    }
    // Do something here to leave it selected correctly
    $("#entities")[0].selectedIndex = selectedIndex;
  }
}

function findAnnotate(param) {
  // Check if finder has selected elements
  if (document.getElementsByClassName("highlight selected").length === 0) {
    window.alert("No elements to annotate found, please use text finder.");
    return;
  } else {
    console.log(document.getElementsByClassName("highlight selected"));

    var pageIndex = window.PdfViewer.viewer.findController.selected.pageIdx;
    console.log(pageIndex);
    // var pageIndex = window.PdfViewer.viewer.currentPageNumber - 1;
    var page = window.PdfViewer.viewer.getPageView(pageIndex);
    var pageRect = page.canvas.getClientRects()[0];
    var viewport = page.viewport;
    var r = document
      .getElementsByClassName("highlight selected")[0]
      .getBoundingClientRect();
    var selected = viewport
      .convertToPdfPoint(r.left - pageRect.x, r.top - pageRect.y)
      .concat(
        viewport.convertToPdfPoint(r.right - pageRect.x, r.bottom - pageRect.y),
      );
    var bounds = viewport.convertToViewportRectangle(selected);
    var height = Math.abs(bounds[1] - bounds[3]);
    var left = Math.min(bounds[0], bounds[2]);
    var top = Math.min(bounds[1], bounds[3]);
    var width = Math.abs(bounds[0] - bounds[2]);
    var text =
      document.getElementsByClassName("highlight selected")[0].firstChild
        .textContent;

    console.log(height, left, top, width);

    var highlight = {
      content: {
        text: text,
      },
      position: {
        boundingRect: {
          x1: left,
          y1: top,
          x2: left + width,
          y2: top + height,
          width: pageRect.width,
          height: pageRect.height,
        },
        rects: [
          {
            x1: left,
            y1: top,
            x2: left + width,
            y2: top + height,
            width: pageRect.width,
            height: pageRect.height,
          },
        ],
        pageNumber: pageIndex + 1,
      },
      comment: {
        text: $("#entities")[0][$("#entities")[0].selectedIndex].value,
        relationship: "",
      },
    };

    console.log(highlight);

    param.addHighlight(window.PdfViewer.viewer.pdfDocument, highlight);
  }
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function rotatePagesClockwise() {
  window.PdfViewer.viewer.pagesRotation += 90;
}

function rotatePagesCounterClockwise() {
  window.PdfViewer.viewer.pagesRotation -= 90;
}

function zoomPagesIn() {
  window.PdfViewer.viewer.currentScale += 0.5;
}

function zoomPagesOut() {
  window.PdfViewer.viewer.currentScale -= 0.5;
}

const Checkbox = ({ label, value, onChange }) => {
  return (
    <label style={{ color: "black" }}>
      {label}
      <input type="checkbox" checked={value} onChange={onChange} />
    </label>
  );
};

function findNextWord(state) {
  window.PdfViewer.pdfFindController.executeCommand("findagain", {
    query: document.getElementById("findInput").value,
    phraseSearch: true,
    caseSensitive: state.match_case_checked,
    entireWord: state.whole_word_checked,
    highlightAll: state.highlight_all_checked,
  });
}

function findLastWord(state) {
  window.PdfViewer.viewer.findController.executeCommand("findagain", {
    query: document.getElementById("findInput").value,
    phraseSearch: true,
    caseSensitive: state.match_case_checked,
    entireWord: state.whole_word_checked,
    highlightAll: state.highlight_all_checked,
    findPrevious: true,
  });
}

function rotate_point(pointX, pointY, originX, originY, angle) {
  angle = (angle * Math.PI) / 180.0;
  return {
    x: pointX * Math.cos(angle) + pointY * Math.sin(angle),
    y: -(pointX * Math.sin(angle)) + pointY * Math.cos(angle),
  };
}

function gettext(pdfDocument) {
  var pdf = pdfjs.getDocument(pdfUrl);
  return pdf.then(function (pdf) {
    // get all pages text
    var maxPages = pdf.pdfInfo.numPages;
    var countPromises = []; // collecting all page promises
    for (var j = 1; j <= maxPages; j++) {
      var page = pdf.getPage(j);

      var txt = "";
      countPromises.push(
        page.then(function (page) {
          // add page promise
          var textContent = page.getTextContent();
          return textContent.then(function (text) {
            // return content promise
            return text.items
              .map(function (s) {
                return s.str;
              })
              .join(""); // value page text
          });
        }),
      );
    }
    // Wait for all pages and join text
    return Promise.all(countPromises).then(function (texts) {
      return texts.join("");
    });
  });
}

async function getT(pdfDocument) {
  var plaintext = "";

  for (var pn = 1; pn <= pdfDocument.numPages; pn++) {
    var page = await pdfDocument.getPage(pn);
    var unscaledViewport = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: 1 });
    var textContent = await page.getTextContent({ normalizeWhitespace: true });
    textContent.items.forEach(function (textItem) {
      plaintext += textItem.str + " ";
    });
  }
  return plaintext;
}

const searchParams = new URLSearchParams(document.location.search);
let d_url = searchParams.get("url") || DEFAULT_URL;

class App extends Component<Props, State> {
  state = {
    highlights: testHighlights[d_url] ? [...testHighlights[d_url]] : [],
    url: d_url,
    data: "",
    text: "",
    tags: defaultTags,
    relationships: [],
    highlight_all_checked: false,
    whole_word_checked: false,
    match_case_checked: false,
  };

  state: State;

  resetHighlights = () => {
    this.setState({
      highlights: [],
      url: this.state.url,
      data: this.state.data,
      text: this.state.text,
      tags: this.state.tags,
      relationships: this.state.relationships,
    });
  };

  removeHighlight = (highlight_id) => {
    this.setState({
      highlights: this.state.highlights.filter(function (highlight) {
        return highlight_id !== highlight.id;
      }),
    });
  };
  editHighlight = (highlight_id) => {
    this.setState({
      highlights: this.state.highlights.filter(function (highlight) {
        return highlight_id !== highlight.id;
      }),
    });
  };

  openPDF = (highlights, url, data) => {
    Split(["#split-0", "#split-1"], { sizes: [25, 75] });

    let schema = defaultTags;
    if (typeof highlights.schema != "undefined") schema = highlights.schema;
    this.setState({
      highlights: highlights.highlights,
      url: url,
      data: data,
      text: "",
      tags: schema,
      relationships: highlights.relationships,
    });
    $("#accordionExample").show();
    highlights.highlights.forEach((hlight) => {
      data.forEach((tag) => {
        if (tag.name == hlight.comment.text) {
          hlight.position.rects.forEach((rect) => {
            rect.background = tag.color;
          });
        }
      });
    });
  };

  openSchema = (data) => {
    //alert(JSON.stringify(data));
    var tempHighlights = this.state.highlights;
    const currentTags = data;

    tempHighlights.forEach((hlight, index) => {
      let found = false;
      data.annotation_types.forEach((tag) => {
        if (tag.name == hlight.comment.text) {
          found = true;
          hlight.position.rects.forEach((rect) => {
            rect.background = tag.color;
          });
        }
      });
      if (!found) tempHighlights.splice(index, 1);
    });

    this.setState({
      highlights: tempHighlights,
      url: this.state.url,
      data: this.state.data,
      text: this.state.text,
      tags: data,
      relationships: this.state.relationships,
    });
    delay(0.1).then(() => jscolor.install());
  };

  openAnnot = (highlights) => {
    let schema = defaultTags;
    if (typeof highlights.schema != "undefined") schema = highlights.schema;
    this.setState({
      highlights: highlights.highlights,
      url: this.state.url,
      data: this.state.data,
      text: this.state.text,
      tags: schema,
      relationships: this.state.relationships,
    });
  };

  scrollViewerTo = (highlight: any) => {};

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());

    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  componentDidMount() {
    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false,
    );

    if (this.state.url == DEFAULT_URL) {
      $("#loadModal").modal("show");
    } else {
      $("#loadModal").modal("hide");
    }

    $("#accordionExample").hide();
  }

  getHighlightById(id: string) {
    const { highlights } = this.state;

    return highlights.find((highlight) => highlight.id === id);
  }

  async addHighlight(pdfDocument, highlight: T_NewHighlight) {
    const { highlights } = this.state;
    const electron = window.require("electron");
    var closest = Number.MAX_VALUE;
    var offset = -1;
    var curr = 0;
    var matches = [];
    var plaintext = "";
    const user = await electron.ipcRenderer.invoke("getUserName");
    for (var pn = 1; pn <= pdfDocument.numPages; pn++) {
      var page = await pdfDocument.getPage(pn);
      var unscaledViewport = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: 1.649169176049577 });
      highlight.content.text = highlight.content.text.trim();
      highlight.userName = user;
      highlight.timestamp = Date.now();
      var textContent = await page.getTextContent({
        normalizeWhitespace: true,
      });

      for (var ti = 0; ti < textContent.items.length; ti++) {
        var textItem = textContent.items[ti];
        var textItemText = textItem.str;
        var highlightText = highlight.content.text;
        var highlightX = highlight.position.boundingRect.x1;
        var highlightY = highlight.position.boundingRect.y1;

        curr = plaintext.length;
        plaintext += textItem.str + " ";

        if (
          textItemText.includes(highlightText) &&
          highlight.position.pageNumber == pn
        ) {
          //neat
          let x = textItem.transform[4];
          let y = textItem.transform[5];
          let w = textItem.width;
          let h = textItem.height;

          const [x1, y1, x2, y2] = vp.convertToViewportRectangle([
            x,
            y,
            w + x,
            h + y,
          ]);
          var a = x1 - highlightX;
          var b = y1 - highlightY;
          var distance = Math.sqrt(a * a + b * b);
          if (distance < closest) {
            closest = distance;
            offset = curr + textItemText.indexOf(highlightText);
          }
        } //if
        else if (
          textItemText.length < highlightText.length &&
          highlight.position.pageNumber == pn
        ) {
          var iterator = ti + 1;
          while (
            textItemText.length < highlightText.length &&
            iterator < textContent.items.length
          ) {
            textItemText += textContent.items[iterator].str;
            iterator++;
          } //while
          if (textItemText.includes(highlightText)) {
            let x = textItem.transform[4];
            let y = textItem.transform[5];
            let w = textItem.width;
            let h = textItem.height;

            const [x1, y1, x2, y2] = vp.convertToViewportRectangle([
              x,
              y,
              w + x,
              h + y,
            ]);
            var a = x1 - highlightX;
            var b = y1 - highlightY;
            var distance = Math.sqrt(a * a + b * b);
            if (distance < closest) {
              closest = distance;
              offset = curr + textItemText.indexOf(highlightText);
            }
          } //if
        } //else if
      } //for textitems
      this.state.tags.annotation_types.forEach((tag) => {
        if (tag.id != 0) {
          let tagID = `.Highlight__` + tag.name;
        }
      });
    } //for pages

    console.log("Saving highlight", highlight);
    let end = offset + highlight.content.text.length;
    highlight.comment.begin = offset;
    highlight.comment.end = end;
    var bg_index = -1;
    const currentTags = this.state.tags;
    const defaultBGColor = "yellow";
    highlight.position.rects.forEach((rect) => {
      rect.background = "yellow"; // TODO THIS NEVER HAPPEN
    });
    currentTags.annotation_types.forEach((tag, index) => {
      if (tag.name == highlight.comment.text) {
        highlight.position.rects.forEach((rect) => {
          rect.background = tag.color;
        });
      }
    });

    this.setState({
      highlights: [{ ...highlight, id: getNextId() }, ...highlights],
      url: this.state.url,
      data: this.state.data,
      tags: this.state.tags,
      relationships: this.state.relationships,
    });
  } //end addHighlight

  updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight", highlightId, position, content);

    this.setState({
      highlights: this.state.highlights.map((h) => {
        return h.id === highlightId
          ? {
              ...h,
              position: { ...h.position, ...position },
              content: { ...h.content, ...content },
            }
          : h;
      }),
      url: this.state.url,
      data: this.state.data,
      tags: this.state.tags,
      relationships: this.state.relationships,
    });
  }

  addRelationshipToAnno = (node: string) => {
    let relations = this.state.relationships;
    let relation = relations.pop();

    if (typeof relation == "object") {
      relation.nodes.push(node);
      relations.push(relation);
    } else alert("no relationship selected");

    this.setState({
      highlights: this.state.highlights,
      url: this.state.url,
      data: this.state.data,
      tags: this.state.tags,
      relationships: this.state.relationships,
    });
  };

  addRelationship = (type: string, head: string, nodes: []) => {
    var relation = {};
    relation.type = type;
    relation.head = head;
    relation.nodes = nodes;
    this.state.relationships.push(relation);

    this.setState({
      highlights: this.state.highlights,
      url: this.state.url,
      data: this.state.data,
      tags: this.state.tags,
      relationships: this.state.relationships,
    });
  };

  addRelationshipType = (type: string) => {
    var tagsTemp = this.state.tags;
    var relTypeTemp = {};
    relTypeTemp.name = type;
    relTypeTemp.color = "yellow";
    relTypeTemp.id = type;
    tagsTemp.relationship_types[tagsTemp.relationship_types.length] =
      relTypeTemp;

    this.setState({
      highlights: this.state.highlights,
      url: this.state.url,
      data: this.state.data,
      tags: tagsTemp,
      relationships: this.state.relationships,
    });
  };

  annoEditType = (id: string, newTag: string) => {
    var editedh = this.state.highlights;
    var index = editedh
      .map(function (e) {
        return e.id;
      })
      .indexOf(id);

    if (index > -1) {
      editedh[index].comment.text = newTag;
    }

    this.setState({
      highlights: editedh,
      url: this.state.url,
      data: this.state.data,
      tags: this.state.tags,
      relationships: this.state.relationships,
    });
  };

  annoEdit = (id: string, comment: string) => {
    if (comment != "") {
      var editedh = this.state.highlights;
      var currentTags = this.state.tags;
      var index = editedh
        .map(function (e) {
          return e.id;
        })
        .indexOf(id);

      if (index > -1) {
        editedh[index].comment.text = comment;
        currentTags.annotation_types.forEach((tag) => {
          if (tag.name == comment) {
            editedh[index].position.rects.forEach((rect) => {
              rect.background = tag.color;
              if (editedh[index].id == id) {
                var curr_highlights =
                  document.getElementsByClassName("Highlight__part");
                var item_x1 = Math.trunc(
                  editedh[index].position.boundingRect.x1,
                );
                var item_y1 = Math.trunc(
                  editedh[index].position.boundingRect.y1,
                );
                if (editedh[index].position.rects.length == 1) {
                  for (var i = 0; i < curr_highlights.length; i++) {
                    var highlight_x1 = Math.trunc(
                      curr_highlights[i].style.left.slice(0, -2),
                    );
                    var highlight_y1 = Math.trunc(
                      curr_highlights[i].style.top.slice(0, -2),
                    );

                    if (highlight_x1 == item_x1 && highlight_y1 == item_y1) {
                      curr_highlights[i].style.background = tag.color;
                    }
                  }
                } else {
                  for (var i = 0; i < curr_highlights.length; i++) {
                    editedh[index].position.rects.forEach((item, i) => {
                      var multi_item_x1 = Math.trunc(item.x1);
                      var multi_item_y1 = Math.trunc(item.y1);
                      var highlight_x1 = Math.trunc(
                        curr_highlights[i].style.left.slice(0, -2),
                      );
                      var highlight_y1 = Math.trunc(
                        curr_highlights[i].style.top.slice(0, -2),
                      );

                      if (
                        highlight_x1 == multi_item_x1 &&
                        highlight_y1 == multi_item_y1
                      ) {
                        curr_highlights[i].style.background = tag.color;
                      }
                    });
                  }
                }
              }
            });
          }
        });
      }

      this.setState({
        highlights: editedh,
        url: this.state.url,
        data: this.state.data,
        tags: this.state.tags,
        relationships: this.state.relationships,
      });
    }
  };

  updateText(text: string) {
    this.setState({
      highlights: this.state.highlights,
      url: this.state.url,
      data: this.state.data,
      text: text,
      tags: this.state.tags,
      relationships: this.state.relationships,
    });
  }

  render() {
    const { highlights } = this.state;
    const { url } = this.state;
    const { data } = this.state;
    const { tags } = this.state;
    const { relationships } = this.state;
    const electron = window.require("electron");
    const ipcRenderer = electron.ipcRenderer;
    const app = electron.app;
    const path = require("path");
    const fs = window.require("fs");
    const { highlight_all_checked } = this.state;
    const { whole_word_checked } = this.state;
    const { match_case_checked } = this.state;

    const highlight_all = () => {
      window.PdfViewer.pdfFindController._dirtyMatch = true;
      this.setState({
        highlight_all_checked: !this.state.highlight_all_checked,
      });
    };

    const whole_word = () => {
      window.PdfViewer.pdfFindController._dirtyMatch = true;
      this.setState({ whole_word_checked: !this.state.whole_word_checked });
    };

    const match_case = () => {
      window.PdfViewer.pdfFindController._dirtyMatch = true;
      this.setState({ match_case_checked: !this.state.match_case_checked });
    };

    return (
      <div
        class="split"
        className="App"
        style={{ display: "flex", height: "100vh" }}
      >
        <Sidebar
          highlights={highlights}
          tags={tags}
          relationships={relationships}
          resetHighlights={this.resetHighlights}
          removeHighlight={this.removeHighlight}
          addRelationship={this.addRelationship}
          openSchema={this.openSchema}
          annoEdit={this.annoEdit}
          annoEditType={this.annoEditType}
          addRelationshipToAnno={this.addRelationshipToAnno}
          addRelationshipType={this.addRelationshipType}
        />

        <div
          id="split-1"
          style={{
            height: "100vh",
            width: "75vw",
            overflowY: "scroll",
            overflowX: "scroll",
            position: "relative",
          }}
        >
          <button onClick={(e) => rotatePagesClockwise()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M15 1a1 1 0 0 0-1 1v2.418A6.995 6.995 0 1 0 8 15a6.954 6.954 0 0 0 4.95-2.05 1 1 0 0 0-1.414-1.414A5.019 5.019 0 1 1 12.549 6H10a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"></path>
            </svg>
          </button>
          <button onClick={(e) => rotatePagesCounterClockwise()}>
            <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16">
              <path d="M1 1a1 1 0 011 1v2.4A7 7 0 118 15a7 7 0 01-4.9-2 1 1 0 011.4-1.5 5 5 0 10-1-5.5H6a1 1 0 010 2H1a1 1 0 01-1-1V2a1 1 0 011-1z"></path>
            </svg>
          </button>
          <button onClick={(e) => zoomPagesIn()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M14 7H9V2a1 1 0 0 0-2 0v5H2a1 1 0 0 0 0 2h5v5a1 1 0 0 0 2 0V9h5a1 1 0 0 0 0-2z"></path>
            </svg>
          </button>
          <button onClick={(e) => zoomPagesOut()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <rect x="2" y="7" width="12" height="2" rx="1"></rect>
            </svg>
          </button>
          <div id="loadModal" class="modal fade">
            <div class="modal-dialog">
              <div class="modal-content">
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                  <li class="nav-item">
                    <a
                      class="nav-link active"
                      id="home-tab"
                      data-toggle="tab"
                      href="#openNewTab"
                      role="tab"
                      aria-controls="home"
                      aria-selected="true"
                    >
                      Open New PDF
                    </a>
                  </li>
                  {/*<li class="nav-item">
                    <a class="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Open Recent</a>
                  </li>*/}
                </ul>

                <div class="modal-body tab-content" id="openNewTab">
                  <div class="container">
                    <div class="row">
                      <div class="col-sm">
                        <button
                          class="btn btn-secondary btn-sm"
                          onClick={async () => {
                            const result =
                              await electron.ipcRenderer.invoke(
                                "openPDFFileDialog",
                              );
                            $("#pdf-url").attr("value", result);
                          }}
                        >
                          Select PDF
                        </button>
                      </div>
                      <div class="col-sm">
                        <input
                          type="text"
                          class="form-control"
                          id="pdf-url"
                          value=""
                        ></input>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-sm">
                        <button
                          class="btn btn-secondary btn-sm"
                          onClick={async () => {
                            const result = await electron.ipcRenderer.invoke(
                              "openSchemaFileDialog",
                            );
                            $("#schema-url").attr("value", result);
                            if (result)
                              $("#loadbutton").prop("disabled", false);
                          }}
                        >
                          Select Schema
                        </button>
                      </div>
                      <div class="col-sm">
                        <input
                          type="text"
                          class="form-control"
                          id="schema-url"
                          value=""
                        ></input>
                      </div>
                    </div>
                    <div class="row"></div>
                    <br></br>

                    <div class="row">
                      <div class="col-sm"></div>
                      <div class="col-sm"></div>
                      <div class="col-sm">
                        <button
                          id="loadbutton"
                          class="btn btn-primary"
                          data-dismiss="modal"
                          onClick={async () => {
                            const result = await electron.ipcRenderer.invoke(
                              "openPDF",
                              $("#pdf-url").val(),
                              $("#schema-url").val(),
                            );
                            $("#loadModal").modal("hide");
                          }}
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <input
            id="findInput"
            className="toolbarField"
            title="Find"
            placeholder="Find in document…"
            tabIndex={91}
            data-l10n-id="find_input"
            style={{
              backgroundImage: 'url("data:image/png',
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "scroll",
              backgroundSize: "16px 18px",
              backgroundPosition: "98% 50%",
              cursor: "auto",
            }}
            data-status
          />
          <button
            onClick={(e) => findLastWord(this.state)}
            id="findPrevious"
            className="toolbarButton findPrevious"
            title="Find the previous occurrence of the phrase"
            tabIndex={92}
            data-l10n-id="find_previous"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M13 11a1 1 0 0 1-.707-.293L8 6.414l-4.293 4.293a1 1 0 0 1-1.414-1.414l5-5a1 1 0 0 1 1.414 0l5 5A1 1 0 0 1 13 11z"></path>
            </svg>
            <span data-l10n-id="find_previous_label"></span>
          </button>
          <button
            onClick={(e) => findNextWord(this.state)}
            id="findNext"
            className="toolbarButton findNext"
            title="Find the next occurrence of the phrase"
            tabIndex={93}
            data-l10n-id="find_next"
          >
            <span data-l10n-id="find_next_label"></span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M8 12a1 1 0 0 1-.707-.293l-5-5a1 1 0 0 1 1.414-1.414L8 9.586l4.293-4.293a1 1 0 0 1 1.414 1.414l-5 5A1 1 0 0 1 8 12z"></path>
            </svg>
          </button>
          <Checkbox
            label="Highlight all "
            value={highlight_all_checked}
            onChange={highlight_all}
          />
          &nbsp;
          <Checkbox
            label="Match case "
            value={match_case_checked}
            onChange={match_case}
          />
          &nbsp;
          <Checkbox
            label="Whole words "
            value={whole_word_checked}
            onChange={whole_word}
          />
          <br />
          <label for="entities" style={{ color: "black" }}>
            Choose an entity:
          </label>
          &nbsp;
          <select name="entities" id="entities">
            <option value="volvo"></option>
            {addTagsToFinder(this.state.tags.annotation_types)}
          </select>
          <button type="button" onClick={(e) => findAnnotate(this)}>
            Annotate
          </button>
          <PdfLoader data={data} url={url} beforeLoad={<Spinner />}>
            {(pdfDocument) => (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={resetHash}
                scrollRef={(scrollTo) => {
                  this.scrollViewerTo = scrollTo;

                  this.scrollToHighlightFromHash();
                }}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection,
                ) => (
                  <Tip
                    tags={this.state.tags}
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      this.addHighlight(pdfDocument, {
                        content,
                        position,
                        comment,
                      });

                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo,
                ) => {
                  const isTextHighlight = !Boolean(
                    highlight.content && highlight.content.image,
                  );

                  ipcRenderer.on(
                    "file-opened",
                    (event, file, content, highlights) => {
                      this.openPDF(highlights, file, content);
                    },
                  );
                  ipcRenderer.on(
                    "annot-opened",
                    (event, file, content, highlights) => {
                      const pdfData = this.state.data;

                      pdfjs
                        .getDocument({
                          data: pdfData,
                          eventBusDispatchToDOM: true,
                        })
                        .promise.then(
                          function (pdfD) {
                            getT(pdfD).then(
                              function (ptext) {
                                if (
                                  confirm(
                                    "Loading annotation file will override all current annotations, are you sure?",
                                  )
                                ) {
                                  // Save it!
                                  if (highlights.text == ptext) {
                                    this.openAnnot(highlights);
                                  } else {
                                    alert(
                                      "Error: Cannot load annotation file - PDF file mismatch",
                                    );
                                  }
                                } else {
                                  // Do nothing!
                                  console.log("Annotations not loaded.");
                                  return;
                                }
                              }.bind(this),
                            );
                          }.bind(this),
                        );
                    },
                  );
                  ipcRenderer.on("schema-file-opened", (event, content) => {
                    this.openSchema(content);
                  });

                  ipcRenderer.on("filepaths", function (event, message) {
                    if (message == undefined) return;
                    else {
                      console.log(message); // Logs filepaths

                      if (fl !== "") {
                        console.log("no filepath found");
                      }
                    }
                    // if you wanna open file use fs
                  });
                  ipcRenderer.on("save-file", (event, app_path) => {
                    console.log(app_path);
                    let url = this.state.url;
                    let highlights = this.state.highlights;
                    let relationships = this.state.relationships;
                    let schema = this.state.tags;

                    const pdfData = this.state.data;

                    pdfjs
                      .getDocument({
                        data: pdfData,
                        eventBusDispatchToDOM: true,
                      })
                      .promise.then((pdfD) => {
                        getT(pdfD).then(function (ptext) {
                          let jsonT = {};
                          jsonT.text = ptext;
                          jsonT.relationships = relationships;
                          jsonT.schema = schema;
                          jsonT.highlights = highlights;

                          fs.writeFile(
                            app_path,
                            JSON.stringify(jsonT),
                            function (err) {
                              if (err) throw err;
                            },
                          );
                        });
                      });
                  });
                  ipcRenderer.once("save-schema", (event, app_path) => {
                    console.log(app_path);
                    let url = this.state.url;
                    let highlights = this.state.highlights;
                    let relationships = this.state.relationships;
                    let schema = this.state.tags;

                    const pdfData = this.state.data;

                    pdfjs
                      .getDocument({
                        data: pdfData,
                        eventBusDispatchToDOM: true,
                      })
                      .promise.then((pdfD) => {
                        getT(pdfD).then(function (ptext) {
                          fs.writeFile(
                            app_path,
                            JSON.stringify(schema),
                            function (err) {
                              if (err) throw err;
                            },
                          );
                        });
                      });
                  });
                  if (typeof highlight.comment !== "undefined") {
                    const component = isTextHighlight ? (
                      <Highlight
                        isScrolledTo={isScrolledTo}
                        position={highlight.position}
                        comment={highlight.comment}
                        tag={highlight.comment.text}
                      />
                    ) : (
                      <AreaHighlight
                        highlight={highlight}
                        onChange={(boundingRect) => {
                          this.updateHighlight(
                            highlight.id,
                            { boundingRect: viewportToScaled(boundingRect) },
                            { image: screenshot(boundingRect) },
                          );
                        }}
                      />
                    );
                    return (
                      <a
                        key={highlight.id}
                        onClick={(e) => {
                          if (e.shiftKey) {
                            this.addRelationshipToAnno(highlight.id);
                          } else {
                            cur_highlgiht_id = highlight.id;
                            jQuery(`#editAnnoModal${highlight.id}`).modal(
                              "show",
                            );
                          }
                        }}
                      >
                        <Popup
                          popupContent={<HighlightPopup {...highlight} />}
                          onMouseOver={(popupContent) =>
                            setTip(highlight, (highlight) => popupContent)
                          }
                          onMouseOut={hideTip}
                          key={index}
                          children={component}
                        />
                      </a>
                    );
                  }
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        </div>
      </div>
    );
  }
}

export default App;
