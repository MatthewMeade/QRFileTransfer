import React, { useState, useEffect } from "react";

import generateQRCodes from "./qrGenerator";

import "./fileSender.scss";

export default function QRGenerator({ sendingFiles: filesMeta, cancel }) {
  if (!Array.isArray(filesMeta)) filesMeta = [filesMeta];

  const [codes, setcodes] = useState([]);

  const useEffectDepencyKey = JSON.stringify(filesMeta);

  useEffect(() => {
    if (filesMeta[0] === null) {
      return;
    }

    generateQRCodes(filesMeta.map((f) => f.id)).then((result) => setcodes(result));
  }, [useEffectDepencyKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div id="fileSender" className="box--shadow">
      <button onClick={() => cancel()}>Go Back</button>
      <p>File Info:</p>
      {/* <pre style={{ width: "80vw", overflow: "hidden" }}>{JSON.stringify(codes, null, 2)}</pre> */}

      {!codes.length && <p>Loading File Data...</p>}

      {codes.length && <p>Read {codes.length} files</p>}

      {codes.length &&
        codes.map((f) => (
          <div key={f.id}>
            <h3>{f.metaData.name}</h3>
            <div>
              <p>MetaData:</p>
              {/* <img src={f.metaCode} alt="Should be a QR code here" /> */}
              <p>Data:</p>

              {f.dataCodes.map((src, i) => (
                <div key={i} style={{ padding: "10em 0" }}>
                  <img src={src} alt="Should be a QR code here" />
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
