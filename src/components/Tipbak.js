import React, { Component } from "react";
import "../style/Tip.css";
import tags from "../tags.json";

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

class Tip extends Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      compact: true,
      text: "",
      relationship: "",
    });
  }

  // for TipContainer
  componentDidUpdate(nextProps, nextState) {
    const { onUpdate } = this.props;

    if (onUpdate && this.state.compact !== nextState.compact) {
      onUpdate();
    }
  }

  render() {
    const { onConfirm, onOpen } = this.props;
    const { compact, text, relationship } = this.state;
    var i = 0;
    let tagsList = tags.map(function (tag) {
      return React.createElement(
        "option",
        { value: tag.name, key: tag.id },
        tag.name
      );
    });
    return React.createElement(
      "div",
      {
        className: "Tip",
      },
      compact
        ? React.createElement(
            "div",
            {
              className: "Tip__compact",
              onClick: () => {
                onOpen();
                this.setState({
                  compact: false,
                });
              },
            },
            "Add Annotation"
          )
        : React.createElement(
            "form",
            {
              className: "Tip__card",
              onSubmit: (event) => {
                event.preventDefault();
                onConfirm({
                  text,
                  relationship,
                });
              },
            },
            React.createElement(
              "div",
              null,
              React.createElement(
                "select",
                {
                  width: "100%",
                  onChange: (event) =>
                    this.setState({
                      text: event.target.value,
                    }),
                },
                tagsList
              )
            ),
            React.createElement(
              "div",
              null,
              React.createElement("input", {
                type: "submit",
                value: "Save",
              })
            )
          )
    );
  }
}

export default Tip;
