import React, { useEffect, createContext, useState } from "react";
import "./styles/App.scss";

import FileUpload from "./components/fileUpload/FileUpload";
import QRScan from "./components/qrScan/QRScan";
import FileList from "./components/fileList/FileList";

import FilesDB from "./FilesDB";
import FileSender from "./components/fileSender/FileSender";

export const FilesContext = createContext([]);

function App() {
  const [files, setFiles] = useState([]);
  const [sendingFiles, setSendingFiles] = useState(null);

  useEffect(() => {
    FilesDB.initialize(setFiles);
  }, []);

  return (
    <FilesContext.Provider value={files}>
      <div className="App">
        <FileUpload />
        <QRScan />
        {sendingFiles ? (
          <FileSender sendingFiles={sendingFiles} cancel={() => setSendingFiles(null)} />
        ) : (
          <FileList sendFiles={setSendingFiles} />
        )}
      </div>
    </FilesContext.Provider>
  );
}

export default App;
