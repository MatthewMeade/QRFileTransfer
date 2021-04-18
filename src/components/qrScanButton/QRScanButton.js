import React from "react";
import "./qrScanButton.scss";

import QRCodeIcon from "../icons/qrCode";

export default function FileUpload({ startReading }) {
  return (
    <div id="qrScanButton" className={`box--shadow`} onClick={startReading}>
      <div id="qrScanButtonContent" className="box">
        <QRCodeIcon />

        <h2>receive files</h2>
        <p>Transfer files from another device</p>
      </div>
    </div>
  );
}
