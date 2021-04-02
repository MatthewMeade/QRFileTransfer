// import React, { useState, useEffect } from "react";

import "./fileReader.scss";

export default function FileReader({ cancel }) {
  return (
    <div id="fileReader" className="box--shadow">
      <button onClick={() => cancel()}>Go Back</button>
    </div>
  );
}
