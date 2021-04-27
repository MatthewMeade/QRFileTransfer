import React, { useEffect, createContext, useState } from "react";
import "./styles/App.scss";

import FileUpload from "./components/fileUpload/FileUpload";
import QRScanButton from "./components/qrScanButton/QRScanButton";
import FileList from "./components/fileList/FileList";

import FilesDB from "./FilesDB";
import FileSender from "./components/fileSender/FileSender";
import FileReader from "./components/fileReader/FileReader";

import { formatFileSize } from "./components/fileList/FileList";

export const FilesContext = createContext([]);

const colors = {
  light: {
    white: "#fff",
    light: "#e9f3fe",
    lightgray: "#eee",
    highlight: "F7FBFF",
  },
  dark: {
    white: "#171717",
    light: "#111",
    lightgray: "#333",
    highlight: "#111",
  },
};

function App() {
  const [files, setFiles] = useState([]);
  const [sendingFile, setSendingFiles] = useState(null);
  const [isReading, setIsReading] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "dark");

  const totalFileSize = files.reduce((t, { size }) => size + t, 0);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    Object.entries(colors[theme ?? "dark"]).forEach(([key, val]) => document.body.style.setProperty(`--${key}`, val));
    document.body.classList.add("loaded"); // Enables animating between themes after initial theme is set
  }, [theme]);

  let body;

  if (isReading) {
    body = (
      <span className="readingPage">
        <FileReader cancel={() => setIsReading(false)} />
      </span>
    );
  } else if (sendingFile) {
    body = (
      <span className="sendingPage">
        <FileSender file={sendingFile} cancel={() => setSendingFiles(null)} />
      </span>
    );
  } else {
    body = (
      <span className="homePage">
        <div id="homeHeader">
          <h1>
            {files.length} Files ({formatFileSize(totalFileSize)})
          </h1>
          <p className="themeToggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme}
          </p>
        </div>
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
