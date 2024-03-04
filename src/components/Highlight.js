import React, { Component } from "react";
import "../style/Highlight.css";

class Highlight extends Component {
  render() {
    const {
      position,
      onClick,
      onMouseOver,
      onMouseOut,
      comment,
      isScrolledTo,
    } = this.props;
    const { rects, boundingRect } = position;
    return React.createElement(
      "div",
      {
        className: `Highlight ${isScrolledTo ? "Highlight--scrolledTo" : ""}`,
      },

      rects.map((rect, index) =>
        React.createElement("div", {
          onMouseOver: onMouseOver,
          onMouseOut: onMouseOut,
          onClick: onClick,
          key: index,
          style: rect,
          className: `Highlight__part`,
          //background: "black",
          id: comment.text,
        }),
      ),
    );
  }
}

export default Highlight;
