import React, { useEffect, createContext, useState } from "react";
import "./App.scss";

import FileUpload from "./components/fileUpload/FileUpload";

import FilesDB from "./FilesDB";

export const FilesContext = createContext([]);

function App() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    FilesDB.initialize(setFiles);
  }, []);

  return (
    <FilesContext.Provider value={{ files }}>
      <div className="App">
        <FileUpload />
        <div id="fileOutput">{JSON.stringify(files, null, 2)}</div>
      </div>
    </FilesContext.Provider>
  );
}

export default App;
