import React, { Component } from "react";
import pdfjs from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

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

class PdfLoader extends Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      pdfDocument: null,
    });
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate({ url }) {
    if (this.props.url !== url) {
      this.load();
    }
  }

  load() {
    const { url, onError } = this.props;
    this.setState({
      pdfDocument: null,
    });

    if (url[0] == "h" || url[0] == ".") {
      pdfjs
        .getDocument({
          url: url,
          eventBusDispatchToDOM: true,
        })
        .promise.then((pdfDocument) => {
          this.setState({
            pdfDocument: pdfDocument,
          });
        })
        .catch(onError);
    } else {
      //alert("here");
      const pdfData = this.props.data;
      pdfjs
        .getDocument({
          data: pdfData,
          eventBusDispatchToDOM: true,
        })
        .promise.then((pdfDocument) => {
          this.setState({
            pdfDocument: pdfDocument,
          });
        })
        .catch(onError); //console.log(url);
    }
  }

  render() {
    const { children, beforeLoad } = this.props;
    const { pdfDocument } = this.state;

    if (pdfDocument) {
      return children(pdfDocument);
    }

    return beforeLoad;
  }
}

export default PdfLoader;
