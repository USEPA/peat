// @flow

import React, { Component } from "react";
import "../style/Tip.css";
import "../lib/bootstrap/js/bootstrap.bundle.min.js";

const jQuery = require("jquery");
window.jQuery = jQuery;
import("bootstrap-select/dist/css/bootstrap-select.min.css");
require("bootstrap-select");

type State = {
  compact: boolean,
  text: string,
  relationship: string,
};

type Props = {
  onConfirm: (comment: { text: string, relationship: string }) => void,
  onOpen: () => void,
  onUpdate?: () => void,
};

class Tip extends Component<Props, State> {
  state: State = {
    compact: true,
    text: "",
    relationship: "",
  };

  // for TipContainer
  componentDidUpdate(nextProps: Props, nextState: State) {
    const { onUpdate } = this.props;
    //alert(this.props.tags);
    jQuery(".selectpicker").selectpicker();
    if (onUpdate && this.state.compact !== nextState.compact) {
      onUpdate();

      let optionList = document.getElementById("tagSelect").options;
      optionList.add(new Option("Select Type: ", ""));

      this.props.tags.annotation_types.forEach((option) =>
        optionList.add(new Option(option.name, option.id)),
      );
    }
  }

  render() {
    const { onConfirm, onOpen } = this.props;
    const { compact, text, relationship } = this.state;

    return (
      <div className="Tip">
        {compact ? (
          <div
            className="Tip__compact"
            onClick={() => {
              onOpen();
              this.setState({ compact: false });
            }}
          >
            Add Annotation
          </div>
        ) : (
          <form
            className="Tip__card"
            onSubmit={(event) => {
              event.preventDefault();
              onConfirm({ text, relationship });
            }}
          >
            <div>
              <div>
                <select
                  id="tagSelect"
                  width="100%"
                  placeholder=""
                  autoFocus
                  value={text}
                  onChange={(event) =>
                    this.setState({ text: event.target.value })
                  }
                  ref={(node) => {
                    if (node) {
                      node.focus();
                    }
                  }}
                />
              </div>
            </div>
            <hr />

            <div>
              <input type="submit" value="Save" />
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default Tip;
