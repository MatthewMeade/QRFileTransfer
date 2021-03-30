import React, { useEffect, useRef, useState } from "react";
import "./qrScan.scss";

import QRCodeIcon from "../icons/qrCode";

export default function FileUpload() {
  const input = useRef(null);

  const [isDragging, setDragging] = useState(false);

  return (
    <div id="qrScan" className={`box--shadow`}>
      <div id="qrScanContent" className="box--dashed">
        <QRCodeIcon />

        <h2>Revieve files</h2>
        <p>Transfer files from another device</p>
      </div>
    </div>
  );
}
