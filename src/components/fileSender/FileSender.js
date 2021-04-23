import React, { useState, useEffect, useRef } from "react";

import QRGenerator from "./qrGenerator";

import "./fileSender.scss";
import BackIcon from "../icons/backIcon";

export default function FileSender({ file, cancel }) {
  const generator = useRef(null);
  const gen = generator.current;

  // const [metaDataCode, setmetaDataCode] = useState(null);
  const [curCodeIndex, setCurCodeIndex] = useState(-1);
  const [curCode, setCurCode] = useState(null);
  const [isAutoRunning, setAuto] = useState(false);

  useEffect(() => {
    if (!file) {
      return;
    }

    generator.current = new QRGenerator(file.id, setCurCode);
  }, [file]);

  const nextCode = async (next) => {
    next = next ?? (curCodeIndex ?? -1) + 1;
    if (next > generator.current.totalParts - 1) {
      next = 0;
    }
    const code = await generator.current.getPartCode(next);
    setCurCodeIndex(next);
    setCurCode(code);
  };

  const prevCode = async () => {
    let next = (curCodeIndex ?? 1) + -1;
    if (next < 0) {
      next = generator.current.totalParts - 1;
    }
    const code = await generator.current.getPartCode(next);
    setCurCodeIndex(next);
    setCurCode(code);
  };

  useInterval(() => {
    if (isAutoRunning) {
      nextCode();
    }
  }, 150);

  const controls = [];

  if (!isAutoRunning && curCodeIndex >= 0) {
    controls.push(
      <span key="prev" className="prev button" onClick={() => prevCode()}>
        Previous
      </span>
    );
  } else if (curCodeIndex !== -1) {
    controls.push(
      <span key="prev" className="prev button disabled">
        Previous
      </span>
    );
  }

  if (curCodeIndex >= 0) {
    controls.push(
      <span key="curIndexInput" className="curIndexInput grid">
        <input
          type="number"
          value={curCodeIndex || 0}
          onChange={(e) => nextCode(parseInt(e.target.value || "0"))}
          min={0}
          max={gen.totalParts - 1}
        />
        <span>/</span>
        <span className="total"> {gen.totalParts - 1}</span>
      </span>
    );
  }

  if (!isAutoRunning) {
    controls.push(
      <span key="next" className="next button" onClick={() => nextCode()}>
        Next
      </span>
    );
  } else {
    controls.push(
      <span key="next" className="next button disabled">
        Next
      </span>
    );
  }

  const controlsElem = <div className="controls">{controls}</div>;

  return (
    <div id="fileSender">
      <div id="fsHeader" className="box--shadow">
        <span onClick={() => cancel()} className="btn">
          <BackIcon /> Back
        </span>

        <h2>
          Sending <wbr />
          {file.name}
        </h2>

        {!curCode && <p className="statusText">Initializing...</p>}
      </div>

      <div className="box--shadow senderBody">
        {curCodeIndex === -1 && <p>Meta Data:</p>}
        <div id="imgWrapper">
          <img src={curCode} alt="Should be a QR code here" />
        </div>
        {controlsElem}

        {curCodeIndex >= 0 && (
          <span
            className={`auto button ${isAutoRunning ? "active" : "disabled"}`}
            onClick={() => setAuto(!isAutoRunning)}
          >
            {isAutoRunning ? "Stop" : "Start"} Auto Next
          </span>
        )}

        {curCodeIndex !== -1 && !isAutoRunning && (
          <span className="metaDataReturn" onClick={() => nextCode(-1)}>
            Return To Meta Data
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
