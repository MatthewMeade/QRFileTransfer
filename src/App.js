import React, { useEffect, createContext, useState } from "react";
import "./styles/App.scss";

import FileUpload from "./components/fileUpload/FileUpload";
import QRScan from "./components/qrScan/QRScan";
import FileList from "./components/fileList/FileList";

import FilesDB from "./FilesDB";

export const FilesContext = createContext([]);

function App() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    FilesDB.initialize(setFiles);
  }, []);

  return (
    <FilesContext.Provider value={files}>
      <div className="App">
        <FileUpload />
        <QRScan />
        <FileList />
      </div>
    </FilesContext.Provider>
  );
}

export default App;
