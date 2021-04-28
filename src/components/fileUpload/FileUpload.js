import React, { useEffect, useRef, useState } from "react";
import "./fileUpload.scss";

import FileUploadIcon from "../icons/fileUpload";

import FilesDB from "../../FilesDB";

const MAX_FILE_SIZE = 1e7; // 1 MB
const WARN_FILE_SIZE = 50000; // 50 KB

const validateFileSize = (files) => {
  if (files.some((f) => f.size > MAX_FILE_SIZE)) {
    alert("Maximum file size is 1 MB");
    return false;
  }

  if (files.some((f) => f.size > WARN_FILE_SIZE)) {
    // eslint-disable-next-line no-restricted-globals
    return confirm(
      "One or more of the attached files is very large (> 50 KB).\nThis file will take a long time to transfer"
    );
  }

  return true;
};

export default function FileUpload() {
  const input = useRef(null);

  const [isDragging, setDragging] = useState(false);

  useEffect(() => {
    const element = document.createElement("input");
    element.type = "file";
    element.multiple = true;

    element.onchange = (e) => {
      const files = [...e.target.files];

      if (!validateFileSize(files)) {
        return;
      }
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
      files = [...event.dataTransfer.files].filter((f) => f.kind === "file").map((f) => f.getAsFile());
    }

    if (!validateFileSize(files)) {
      return;
    }

    FilesDB.addFiles(files);
  };

  return (
    <div id="fileUpload" className={`box--shadow ${isDragging ? "dragging" : "not-dragging"}`}>
      <div
        id="drop_zone"
        className="box"
        onDrop={(e) => onDrop(e)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDragEnd={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onClick={() => input.current.click()}
      >
        <FileUploadIcon />

        <h2>Upload files</h2>
        <p>Your files will be stored in the browser</p>
      </div>
    </div>
  );
}
