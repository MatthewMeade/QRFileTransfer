/* eslint-disable no-restricted-globals */
import React, { useContext } from "react";
import { saveAs } from "file-saver";

import "./fileList.scss";

import { FilesContext } from "../../App";
import FilesDB from "../../FilesDB";

// import QRCodeIcon from "../icons/qrCode";
import ImageIcon from "../icons/imageIcon";
import FileIcon from "../icons/fileIcon";
import VideoIcon from "../icons/videoIcon";
import TextFileIcon from "../icons/textFileIcon";
import AudioIcon from "../icons/audioIcon";
import ZipIcon from "../icons/zipIcon";
import DeleteIcon from "../icons/deleteIcon";
import DownloadIcon from "../icons/downloadIcon";
import SendIcon from "../icons/sendIcon";

export default function FileList({ sendFiles }) {
  const files = useContext(FilesContext);

  const items = files.map((file) => <FileListItem file={file} key={file.name} sendFiles={sendFiles} />);

  return (
    <div id="fileList" className="">
      {items}
    </div>
  );
}

function FileListItem({ file, sendFiles }) {
  const date = new Date(file.timestamp);

  const [type1, type2] = file.type.split("/");
  const type3 = type2?.split(".").slice(-1)[0];
  const type4 = type3?.split("-").slice(-1)[0];
  const type = type4 || type3 || type2 || type1;

  return (
    <div id="fileListItem" className="box--shadow">
      <span className="icon">
        <FileTypeIcon type={file.type} />
      </span>
      <h3>{file.name}</h3>

      <span className="fileSize">{formatFileSize(file.size)}</span>

      <span className="timestamp">{date.toLocaleDateString()}</span>
      <span className="type">{type.toUpperCase()}</span>

      <span className="buttons">
        <span onClick={() => confirm(`Are you sure you want to delete ${file.name} ?`) && FilesDB.deleteFile(file.id)}>
          <DeleteIcon />
        </span>
        <span onClick={() => downloadFile(file)}>
          <DownloadIcon />
        </span>
        <span onClick={() => sendFiles(file)}>
          <SendIcon />
        </span>
      </span>
    </div>
  );
}

function downloadFile(file) {
  FilesDB.getFileByID(file.id).then(({ data }) => {
    //   const fileStream = streamSaver.createWriteStream(file.name, {
    //     size: file.size,
    //   });

    //   data
    //     .stream()
    //     .pipeTo(fileStream)
    //     .then((...all) => {
    //       console.log(all);
    //     })
    //     .catch((e) => console.log(e));
    // });

    saveAs(data, file.name);
  });
}

const words = ["B", "KB", "MB", "GB"];
export function formatFileSize(size = 0) {
  let cur = 0;
  while (size >= 1000) {
    size /= 1000;
    cur += 1;
  }
  return `${size.toFixed(0)} ${words[cur]}`;
}

// TODO: Add more of these
const generalIconMap = {
  image: <ImageIcon />,
  video: <VideoIcon />,
  text: <TextFileIcon />,
  audio: <AudioIcon />,
};
function FileTypeIcon({ type }) {
  const [generalPart, specificPart] = type.split("/");

  if (generalIconMap[generalPart]) {
    return generalIconMap[generalPart];
  }

  if (specificPart?.includes("zip")) {
    return <ZipIcon />;
  }

  return <FileIcon />;
}
