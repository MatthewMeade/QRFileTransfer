import React, { useEffect, useRef, useState } from "react";
import "./fileUpload.scss";

import FileUploadIcon from "../icons/fileUpload";

import FilesDB from "../../FilesDB";

export default function FileUpload() {
  const input = useRef(null);

  const [isDragging, setDragging] = useState(false);

  useEffect(() => {
    const element = document.createElement("input");
    element.type = "file";
    element.multiple = true;

    element.onchange = (e) => {
      const files = [...e.target.files];
      FilesDB.addFiles(files);
    };

    input.current = element;

    return () => input.current.remove();
  }, []);

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    let files;

    if (event.dataTransfer.items) {
      files = [...event.dataTransfer.items].filter((f) => f.kind === "file").map((f) => f.getAsFile());
    } else {
      files = [...event.dataTransfer.files49oo].filter((f) => f.kind === "file").map((f) => f.getAsFile());
    }

    FilesDB.addFiles(files);
  };

  return (
    <div id="fileUpload" className={`box--shadow ${isDragging ? "dragging" : "not-dragging"}`}>
      <div
        id="drop_zone"
        className="box--dashed"
        onDrop={(e) => onDrop(e)}
        onDragOver={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragEnd={() => setDragging(false)}
        onClick={(e) => input.current.click()}
      >
        <FileUploadIcon />

        {/* <span className="drop">Drop</span> files or <span className="browse">Browse</span> */}
        <h2>Upload files</h2>
        <p>Your files will be stored in the browser</p>
      </div>
    </div>
  );
}
