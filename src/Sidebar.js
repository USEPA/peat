// @flow

import React, { useState } from "react";
import type { T_Highlight } from "react-pdf-highlighter/src/types";
type T_ManuscriptHighlight = T_Highlight;

const jQuery = require("jquery");
window.jQuery = jQuery;
require("popper.js");
require("bootstrap");
import "./lib/bootstrap/css/bootstrap.min.css";
import("bootstrap-select/dist/css/bootstrap-select.min.css");
import "./style/custom.css";
import "datatables.net";
import "./lib/datatables/css/jquery.dataTables.min.css";
import "./lib/datatables/js/dataTables.buttons.min.js";
import "./lib/datatables/css/buttons.dataTables.min.css";
require("bootstrap-select");
require("@eastdesire/jscolor");

type Props = {
  highlights: Array<T_ManuscriptHighlight>,
  tags: Object,
  relationships: Array<String>,
  resetHighlights: () => void,
  removeHighlight: () => void,
  addRelationship: () => void,
  annoEdit: () => void,
};

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

const updateHash = (highlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

function updateTable(t, text, type, userName, page, id) {
  t.row.add([text, type, userName, page, id]).draw(false);
}

var t;

function Sidebar({
  highlights,
  tags,
  relationships,
  resetHighlights,
  removeHighlight,
  addRelationship,
  openSchema,
  annoEdit,
  annoEditType,
  addRelationshipToAnno,
  addRelationshipType,
}: Props) {
  const groupedByDate = {};
  if (jQuery.fn.dataTable.isDataTable("#table_id")) {
  } else {
    t = jQuery("#table_id").DataTable({
      // data: data,
      paging: false,
      order: [[1, "asc"]],
      columnDefs: [
        {
          target: 4,
          visible: false,
          searchable: false,
        },
      ],
      dom: "Bf",
      buttons: [
        {
          text: "Delete row",
          action: function (e, dt, node, config) {
            if (t.row(".selected").data()) {
              removeHighlight(t.row(".selected").data()[4]);
              t.row(".selected").remove().draw(false);
            } else {
              alert("No rows selected");
            }
          },
        },
      ],
    });
    jQuery("#table_id tbody").on("click", "tr", function () {
      if (jQuery(this).hasClass("selected")) {
        jQuery(this).removeClass("selected");
      } else {
        t.$("tr.selected").removeClass("selected");
        jQuery(this).addClass("selected");
      }
    });
  }

  highlights.forEach((message) => {
    const key = message.comment.text;

    // push message to existing key or create new array containing this message
    if (groupedByDate[key]) {
      groupedByDate[key].push(message);
    } else {
      groupedByDate[key] = [message];
    }
  });
  var myMap = Object.values(groupedByDate);

  jQuery("select[name=reltypesel]").change(function () {
    if (jQuery(this).val() == "") {
      var newType = "new";
      var newValue = jQuery("option", this).length;
      jQuery("<option>").text(newType).attr("value", newValue);
      jQuery(this).val(newValue);
    }
  });

  // Highlight Sorting Logic
  myMap = myMap.sort((a, b) =>
    a[0].comment.text > b[0].comment.text ? 1 : -1
  );
  t.clear();
  // t2.clear();

  return (
    <div id="split-0" className="sidebar" style={{ width: "35vw" }}>
      {/*Annotation modal creation*/}
      {myMap.map((highlight, index) => (
        <div>
          {highlight.map((message) => (
            <div
              className="modal show"
              id={`editAnnoModal${message.id}`}
              tabIndex="-1"
              role="dialog"
              aria-labelledby="ModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="ModalLabel">
                      Edit Annotation
                    </h5>
                    <button
                      type="button"
                      className="close"
                      aria-label="Close"
                      onClick={() =>
                        jQuery(`#editAnnoModal${message.id}`).modal("hide")
                      }
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body container">
                    <div className="row">
                      {message.content.text ? (
                        <blockquote style={{ padding: "1rem", float: "left" }}>
                          {`${message.content.text}`}
                        </blockquote>
                      ) : null}
                    </div>
                    <div className="row">
                      <select id={"annoEditSel" + message.id}>
                        <option value="" selected="selected" hidden="hidden">
                          {message.comment.text}
                        </option>
                        {tags.annotation_types.map((tag, tindex) => (
                          <option value={tag.name} key={tindex}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        jQuery(`#editAnnoModal${message.id}`).modal("hide")
                      }
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        annoEdit(
                          message.id,
                          jQuery("#annoEditSel" + message.id).val()
                        );
                        jQuery(`#editAnnoModal${message.id}`).modal("hide");
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      {/*modal end*/}

      <ul className="nav nav-tabs" id="myTab" role="tablist">
        <li className="nav-item">
          <a
            className="nav-link active"
            id="annotation-tab"
            data-toggle="tab"
            href="#annotation"
            role="tab"
            aria-controls="annotation"
            aria-selected="true"
          >
            Annotations
          </a>
        </li>
        {/*}<li className="nav-item">
          <a className="nav-link" id="relationship-tab" data-toggle="tab" href="#rel" role="tab" aria-controls="relationship" aria-selected="false">Relationships</a>
        </li>*/}
      </ul>

      <div className="tab-content" id="myTabContent">
        <div
          className="tab-pane fade show active"
          id="annotation"
          role="tabpanel"
          aria-labelledby="annotation-tab"
        >
          <button
            type="button"
            className="btn btn-link"
            data-toggle="modal"
            data-target="#editSchemaModal"
          >
            Edit Schema
          </button>

          <div className="accordion" id="accordionExample">
            {
              <table id="table_id" class="display">
                <thead>
                  <tr>
                    <th>Text</th>
                    <th>Type</th>
                    <th>Page</th>
                    <th>User</th>
                  </tr>
                </thead>
              </table>
            }

            {myMap.map((highlight, index) => (
              <div>
                {highlight.map((message) => (
                  <div
                    id={"collapse" + index}
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingOne"
                    key={index}
                    onClick={() => {
                      updateHash(message);
                    }}
                  >
                    <div class="accordion-body">
                      {updateTable(
                        t,
                        message.content.text,
                        message.comment.text,
                        message.position.pageNumber,
                        `${message.userName}`,
                        message.id
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          class="modal show"
          id="editSchemaModal"
          tabindex="1"
          role="dialog"
          aria-labelledby="ModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="ModalLabel">
                  Edit Schema
                </h5>
                <button
                  type="button"
                  class="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <table id="tagsTable">
                  <tbody>
                    {tags.annotation_types.map((tag, index) => (
                      <tr key={index} id={tag.name + "modaltr" + index}>
                        <th>
                          <p
                            id={"p-" + tag.id}
                            name="tagname"
                            contentEditable="true"
                          >
                            {tag.name}
                          </p>
                        </th>
                        <th>
                          <input
                            class="jscolor"
                            id={"tagcolor" + index}
                            name={"tagcolor"}
                            data-jscolor="{}"
                            defaultValue={tag.color}
                          ></input>
                        </th>
                        <th>
                          <button
                            onClick={function () {
                              if (confirm("Remove " + tag.name + "?")) {
                                let tempdtags = tags;
                                tempdtags.annotation_types.splice(index, 1);
                                tempdtags.annotation_types.forEach(
                                  (e, cpindex) => {
                                    document
                                      .getElementById("tagcolor" + cpindex)
                                      .jscolor.fromString(e.color);
                                  }
                                );
                                openSchema(tempdtags);
                                jscolor.install();
                              }
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-trash"
                              viewBox="0 0 16 16"
                            >
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                              <path
                                fill-rule="evenodd"
                                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                              />
                            </svg>
                          </button>
                        </th>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                class="btn btn-link"
                onClick={function () {
                  let t = {};
                  let tempt = tags;
                  t.id = "<new>";
                  t.name = "<new>";
                  t.color = "#FBFF17";
                  tempt.annotation_types.push(t);
                  openSchema(tempt);
                  jscolor.install();
                }}
              >
                Add Entity Type
              </button>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  data-dismiss="modal"
                  onClick={function () {
                    var inputs, index;
                    var tagNameInputs = document.getElementsByName("tagname");
                    var tagColorInputs = document.getElementsByName("tagcolor");
                    var temp = {};
                    var tempTags = {
                      annotation_types: [],
                      relationship_types: [],
                    };
                    inputs = document.getElementsByTagName("input");

                    for (index = 0; index < tagNameInputs.length; ++index) {
                      temp = {};
                      temp.id = tagNameInputs[index].textContent;
                      temp.name = tagNameInputs[index].textContent;
                      temp.color = tagColorInputs[index].value;
                      tempTags.annotation_types[index] = temp;
                      //check for edited tag names

                      if (tagNameInputs[index].id != "p-" + temp.name) {
                        highlights.forEach((htemp) => {
                          if (
                            "p-" + htemp.comment.text ==
                            tagNameInputs[index].id
                          ) {
                            annoEditType(htemp.id, temp.name);
                          }
                        });
                      }
                    }
                    tags = tempTags;

                    openSchema(tempTags);
                    jscolor.install();
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
