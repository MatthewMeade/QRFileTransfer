import React, { useEffect, useRef } from "react";
import "./fileUpload.scss";

import FileUploadIcon from "../../icons/fileUpload";

import FilesDB from "../../FilesDB";

export default function FileUpload() {
  const input = useRef(null);

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

    let files;

    if (event.dataTransfer.items) {
      files = [...event.dataTransfer.items].filter((f) => f.kind === "file").map((f) => f.getAsFile());
    } else {
      files = [...event.dataTransfer.files49oo].filter((f) => f.kind === "file").map((f) => f.getAsFile());
    }

    FilesDB.addFiles(files);
  };

  return (
    <div
      id="drop_zone"
      onDrop={(e) => onDrop(e)}
      onDragOver={(e) => e.preventDefault()}
      onClick={(e) => input.current.click()}
    >
      <h2>Upload a file</h2>

      <FileUploadIcon />

      <p>Drag and drop your file or click here to upload</p>
    </div>
  );
}
