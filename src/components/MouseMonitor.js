import React, { Component } from "react";

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

class MouseMonitor extends Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "container", void 0);

    _defineProperty(this, "onMouseMove", (event) => {
      if (!this.container) {
        return;
      }

      const { onMoveAway, paddingX, paddingY } = this.props;
      const { clientX, clientY } = event; // TODO: see if possible to optimize

      const { left, top, width, height } =
        this.container.getBoundingClientRect();
      const inBoundsX =
        clientX > left - paddingX && clientX < left + width + paddingX;
      const inBoundsY =
        clientY > top - paddingY && clientY < top + height + paddingY;
      const isNear = inBoundsX && inBoundsY;

      if (!isNear) {
        onMoveAway();
      }
    });
  }

  componentDidMount() {
    document.addEventListener("mousemove", this.onMouseMove);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onMouseMove);
  }

  render() {
    // eslint-disable-next-line
    const { onMoveAway, paddingX, paddingY, children, ...restProps } =
      this.props;
    return React.createElement(
      "div",
      {
        ref: (node) => (this.container = node),
      },
      React.cloneElement(children, restProps),
    );
  }
}

export default MouseMonitor;
