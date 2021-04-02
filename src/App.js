import React, { useEffect, createContext, useState } from "react";
import "./styles/App.scss";

import FileUpload from "./components/fileUpload/FileUpload";
import QRScanButton from "./components/qrScanButton/QRScanButton";
import FileList from "./components/fileList/FileList";

import FilesDB from "./FilesDB";
import FileSender from "./components/fileSender/FileSender";
import FileReader from "./components/fileReader/FileReader";

export const FilesContext = createContext([]);

function App() {
  const [files, setFiles] = useState([]);
  const [sendingFiles, setSendingFiles] = useState(null);
  const [isReading, setIsReading] = useState(false);

  let body;

  if (isReading) {
    body = (
      <span className="readingPage">
        <FileReader cancel={() => setIsReading(false)} />
      </span>
    );
  } else if (sendingFiles) {
    body = (
      <span className="sendingPage">
        <FileSender sendingFiles={sendingFiles} cancel={() => setSendingFiles(null)} />
      </span>
    );
  } else {
    body = (
      <span className="homePage">
        <FileUpload />
        <QRScanButton startReading={() => setIsReading(true)} />
        <FileList sendFiles={setSendingFiles} />
      </span>
    );
  }

  useEffect(() => {
    FilesDB.initialize(setFiles);
  }, []);

  return (
    <FilesContext.Provider value={files}>
      <div className="App">{body}</div>
    </FilesContext.Provider>
  );
}

export default App;
