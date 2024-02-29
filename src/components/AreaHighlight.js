import React, { Component } from "react"; // $FlowFixMe

import Rnd from "react-rnd";
import "../style/AreaHighlight.css";

function _extends() {
  _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

class AreaHighlight extends Component {
  render() {
    const { highlight, onChange, ...otherProps } = this.props;
    return React.createElement(
      Rnd,
      _extends(
        {
          className: "AreaHighlight",
          onDragStop: (_, data) => {
            const boundingRect = {
              ...highlight.position.boundingRect,
              top: data.y,
              left: data.x,
            };
            onChange(boundingRect);
          },
          onResizeStop: (_, direction, ref, delta, position) => {
            const boundingRect = {
              top: position.y,
              left: position.x,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            };
            onChange(boundingRect);
          },
          position: {
            x: highlight.position.boundingRect.left,
            y: highlight.position.boundingRect.top,
          },
          size: {
            width: highlight.position.boundingRect.width,
            height: highlight.position.boundingRect.height,
          },
          onClick: (event) => {
            event.stopPropagation();
            event.preventDefault();
          },
        },
        otherProps
      )
    );
  }
}

export default AreaHighlight;
