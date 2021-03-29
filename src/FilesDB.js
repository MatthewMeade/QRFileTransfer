import { openDB } from "idb";

import { hashArrayBuffer } from "./workers/hashWorker";

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

  static async getFileByName(name) {
    return FileDB.db.get("files", name);
  }

  static async getFileMetaDataByName(name) {
    return FileDB.db.get("filesMeta", name);
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

    let data = await readFileAsync(f);

    const id = await hashArrayBuffer(data, f.name);

    const metaData = {
      id,
      name: f.name,
      type: f.type,
      timestamp: Date.now(),
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
    fR.readAsArrayBuffer(file);
  });
};
