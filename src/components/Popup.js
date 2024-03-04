import React, { Component } from "react";
import MouseMonitor from "./MouseMonitor";

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

class Popup extends Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      mouseIn: false,
    });
  }

  render() {
    const { onMouseOver, popupContent, onMouseOut } = this.props;
    return React.createElement(
      "div",
      {
        onMouseOver: () => {
          this.setState({
            mouseIn: true,
          });
          onMouseOver(
            React.createElement(MouseMonitor, {
              onMoveAway: () => {
                if (this.state.mouseIn) {
                  return;
                }

                onMouseOut();
              },
              paddingX: 60,
              paddingY: 30,
              children: popupContent,
            }),
          );
        },
        onMouseOut: () => {
          this.setState({
            mouseIn: false,
          });
        },
      },
      this.props.children,
    );
  }
}

export default Popup;
