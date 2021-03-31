import { openDB } from "idb";

import { hashBlob } from "./workers/hashWorker";

export default class FileDB {
  static async initialize(setReactState) {
    if (FileDB.db) {
      return;
    }

    this.setReactState = setReactState;

    window.FileDB = FileDB;

    FileDB.db = await openDB("Files", 1, {
      upgrade(db) {
        db.createObjectStore("files", { keyPath: "id" });
        db.createObjectStore("filesMeta", { keyPath: "id" });
      },
    });

    FileDB.updateReactState();
  }

  static async addFile(file) {
    file = (await processFiles([file]))[0];
    await FileDB.db.put("files", file);
    await FileDB.db.put("filesMeta", file.metaData);

    return FileDB.updateReactState();
  }

  static async addFiles(files) {
    files = await processFiles(files);
    return Promise.all(files.map((f) => FileDB.addFile(f)));
  }

  static async getFileByID(id) {
    return FileDB.db.get("files", id);
  }

  static async getFileMetaDataByID(id) {
    return FileDB.db.get("filesMeta", id);
  }

  static async getAllFilesMetaData() {
    return FileDB.db.getAll("filesMeta");
  }

  static async updateReactState() {
    const fileMetaData = await FileDB.getAllFilesMetaData();
    FileDB.setReactState(fileMetaData);
  }

  static async clearDB() {
    await FileDB.db.clear("filesMeta");
    await FileDB.db.clear("files");

    return FileDB.updateReactState();
  }
}

const processFiles = async (files) => {
  const promises = files.map(async (f) => {
    if (f.data) {
      return f;
    }

    // const data = await f.arrayBuffer();
    const data = f;

    const id = await hashBlob(data, f.name);

    const metaData = {
      id,
      name: f.name,
      type: f.type,
      timestamp: Date.now(),
      size: data.size,
    };

    return {
      id,
      data,
      metaData,
    };
  });

  return await Promise.all(promises);
};

const readFileAsync = (file) => {
  return new Promise((res) => {
    const fR = new FileReader();
    fR.onload = (e) => res(e.target.result);
    addListeners(fR);
    fR.readAsArrayBuffer(file);
  });
};

function handleEvent(event) {
  console.log(event);
}

function addListeners(reader) {
  reader.addEventListener("loadstart", handleEvent);
  // reader.addEventListener("load", handleEvent);
  reader.addEventListener("loadend", handleEvent);
  reader.addEventListener("progress", handleEvent);
  reader.addEventListener("error", handleEvent);
  reader.addEventListener("abort", handleEvent);
}
