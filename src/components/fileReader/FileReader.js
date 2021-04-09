import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

import "./fileReader.scss";

import FileBuilder from "./FileBuilder";

const videoConstraints = {
  width: 1920,
  height: 1080,
};

export default function FileReader({ cancel }) {
  const camRef = useRef(null);

  useEffect(() => {}, []); // eslint-disable-line

  return (
    <div id="fileReader" className="box--shadow">
      <button onClick={() => cancel()}>Go Back</button>

      <br />
      <Webcam
        audio={false}
        imageSmoothing={false}
        ref={camRef}
        videoConstraints={videoConstraints}
        width={videoConstraints.width}
        height={videoConstraints.height}
      />

      <button onClick={captureImage}>Capture photo</button>
    </div>
  );
}
