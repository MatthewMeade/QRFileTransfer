import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

import "./fileReader.scss";

import FileBuilder from "./FileBuilder";

const videoConstraints = {
  width: 1920,
  height: 1080,
};

export default function FileReader({ cancel }) {
  const camRef = useRef(null);
  const builderRef = useRef(new FileBuilder(camRef));

  const [curState, setState] = useState("METADATA");
  const [readPerc, setReadPerc] = useState(0);

  useInterval(() => {
    const builder = builderRef.current;

    if (builder.isBusy || curState === "SAVING" || curState === "DONE") return;

    if (!builder.metaData) {
      setState("METADATA");
      return builder.scan();
    }

    if (!builder.hasAllParts) {
      setState("PARTS");
      return builder.scan().then(() => setReadPerc(builder.readPercentage.toFixed(2)));
    }

    setState("SAVING");

    builder.saveToDatabase(() => {
      setState("DONE");
    });
  }, 250);

  let content;
  switch (curState) {
    case "METADATA":
      content = <div className="metadata">Scan Metadata</div>;
      break;
    case "PARTS":
      content = <div className="parts">Scan Parts: {readPerc}%</div>;
      break;
    case "SAVING":
      content = <div className="saving">Saving file to database...</div>;
      break;
    case "DONE":
      content = (
        <div className="done">
          Done! <span onClick={() => cancel()}>Click here to return to file list</span>
        </div>
      );
      break;
    default:
      break;
  }

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

      {content}
    </div>
  );
}

// Todo: Refactor this

function useInterval(callback, delay) {
  const intervalId = React.useRef(null);
  const savedCallback = React.useRef(callback);
  React.useEffect(() => {
    savedCallback.current = callback;
  });
  React.useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === "number") {
      intervalId.current = window.setInterval(tick, delay);
      return () => window.clearInterval(intervalId.current);
    }
  }, [delay]);
  return intervalId.current;
}
