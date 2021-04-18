import React, { useEffect, useRef, useState } from "react";

import "./fileReader.scss";

import FileBuilder from "./FileBuilder";
import BackIcon from "../icons/backIcon";

import { formatFileSize } from "../fileList/FileList";

function cameraTick(builderRef, setState, curState) {
  const builder = builderRef.current;

  if (curState === "DONE") {
    return;
  }
  if (!builder.metaData) {
    setState("METADATA");
  } else if (builder.hasAllParts) {
    setState("SAVING");
    builder.saveToDatabase(() => {
      setState("DONE");
    });
  } else {
    setState("PARTS");
  }

  builder.scan();
}

export default function FileReader({ cancel }) {
  const [curState, setState] = useState("Init");
  const [percentage, setPercentage] = useState(0);
  const [err, setErr] = useState(null);
  const [showMissing, setShowMissing] = useState(false);
  const [facingMode, setFacing] = useState("environment");

  const videoRef = useRef(document.createElement("video"));
  const canvasRef = useRef(null);
  const builderRef = useRef(new FileBuilder(canvasRef));

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facingMode }, audio: false })
      .then((mStream) => {
        const video = videoRef.current;
        video.srcObject = mStream;
        video.play();

        video.addEventListener("canplay", () => {
          const canvas = canvasRef.current;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        });
      })
      .catch((err) => {
        setState("ERROR");
        setErr("Failed to get camera");
      });
  }, [facingMode]);

  useInterval(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const builder = builderRef.current;
    if (!canvas || !video) return;

    cameraTick(builderRef, setState, curState);

    if (builder.err) {
      setState("ERROR");
      setErr(builder.err);
    }

    if (percentage !== builder.readPercentage) {
      setPercentage(builder.readPercentage);
    }

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    const location = builder.location;
    if (!location || curState === "DONE") {
      return;
    }

    const padding = 5;
    const { topLeftCorner, bottomRightCorner } = location;

    ctx.strokeStyle = "#1c87ff";
    ctx.lineJoin = "bevel";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      topLeftCorner.x - padding,
      topLeftCorner.y - padding,
      bottomRightCorner.x - topLeftCorner.x + padding * 2,
      bottomRightCorner.y - topLeftCorner.y + padding * 2
    );
  }, 33);

  const builder = builderRef.current;
  let eText = "";
  if (builder.metaData) {
    eText = `${builder.metaData.name} - ${formatFileSize(builder.metaData.size)}`;
  }

  let header;
  switch (curState) {
    case "METADATA":
      header = <h2>Scan Meta Data Code</h2>;
      break;
    case "PARTS":
      header = <h2>Scan File Parts ({percentage.toFixed(0)}%)</h2>;
      break;
    case "SAVING":
      header = <h2>Saving File...</h2>;
      break;
    case "DONE":
      header = <h2>Done!</h2>;
      break;
    case "ERROR":
      header = <h2>Error!</h2>;
      break;
    default:
      header = <h2>Unknown State</h2>;
      break;
  }

  let body;
  switch (curState) {
    case "METADATA":
    case "PARTS":
      body = navigator.mediaDevices.getSupportedConstraints()["facingMode"] ? (
        <h2 onClick={() => setFacing(facingMode === "user" ? "environment" : "user")}>Switch Camera</h2>
      ) : null;
      break;
    case "SAVING":
      body = <h2>Saving File</h2>;
      break;
    case "DONE":
      body = <h2 onClick={() => cancel()}>Return to file list</h2>;
      break;
    case "ERROR":
      body = (
        <span>
          <p>{err}</p>
        </span>
      );
      break;
    default:
      body = <h2>Unknown State</h2>;
      break;
  }
  return (
    <div id="fileReader">
      <div id="frHeader" className="box--shadow">
        <span onClick={() => cancel()} className="btn">
          <BackIcon /> Back
        </span>

        {header}

        <p className="statusText">{eText}</p>
      </div>

      <div id="frBody" className="box--shadow">
        {body}
        <div id="canvasWrapper">
          <canvas ref={canvasRef}></canvas>
        </div>

        {curState === "PARTS" && (
          <span className="missingWrapper">
            <button className="missingBtn" onClick={() => setShowMissing(!showMissing)}>
              {showMissing ? "Hide" : "Show"} Missing Parts
            </button>
            {showMissing && (
              <div className="missingList">
                {builder.missingParts.map((n) => (
                  <p key={n}>{n}</p>
                ))}
              </div>
            )}
          </span>
        )}
      </div>
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
