import jsQR from "jsqr";

import FilesDB from "../../FilesDB";
import { PART_SIZE } from "../fileSender/qrGenerator";
import { hashBlob } from "../../workers/hashWorker";

export default class FileReader {
  constructor(camRef) {
    this.camRef = camRef;
    this.metaData = null;
    this.fileData = null;
    this.partProgress = [false];
    this.error = null;
    this.isBusy = false;
  }

  get hasAllParts() {
    return this.partProgress.every((n) => n);
  }

  finishPart(n) {
    this.partProgress[n] = true;
  }

  async readMetaData() {
    const md = await this.readImage(true);
    if (!md || !md.id) {
      return null;
    }

    if (await FilesDB.getFileMetaDataByID(md.id)) {
      this.err = "FILE_EXISTS";
    }

    this.fileData = new Uint8ClampedArray(md.size);
    this.partProgress = new Array(Math.ceil(md.size / PART_SIZE));

    this.metaData = md;

    console.log("Got Meta Data");
    console.log(this.metaData);

    return md;
  }

  async readFilePart() {
    let data = await this.readImage();
    if (!data || !data.binaryData || data.binaryData.length < 4) {
      return;
    }

    data = data.binaryData;

    const numParts = this.partProgress.length - 1;

    const [p0, p1, p2, ...filePart] = data;
    const partStr = p0.toString(2).padStart(8, "0") + p1.toString(2).padStart(8, "0") + p2.toString(2).padStart(8, "0");
    const partNum = parseInt(partStr, 2);

    if (this.partProgress[partNum]) {
      return;
    }

    // Validate size
    const size = filePart.length;
    const expectedFinalSize = this.metaData.size % PART_SIZE || PART_SIZE;
    if (partNum > numParts) return;
    if (size > PART_SIZE) return;
    if (partNum === numParts && expectedFinalSize !== size) return;
    if (partNum !== numParts && size !== PART_SIZE) return;

    this.fileData.set(new Uint8ClampedArray(filePart), filePart * PART_SIZE);
    this.finishpart(partNum);

    console.log({ partNum, numParts, data });
  }

  async readImage(asJson) {
    const canvas = this.camRef.current.getCanvas();
    if (!canvas) return null;
    const { width, height } = canvas;
    const pixels = canvas.getContext("2d").getImageData(0, 0, width, height);

    const data = await jsQR(pixels.data, width, height);

    if (asJson) {
      try {
        return JSON.parse(data.data);
      } catch (e) {
        return null;
      }
    }

    return data;
  }

  async saveToDatabase() {
    if (!this.hasAllParts) return { err: "NOT READY TO SAVE, NEED MORE PARTS" };

    const blob = new Blob([this.fileData.buffer], { type: this.metaData.type, endings: "transparent" });
    const hash = await hashBlob(blob);

    if (hash !== this.metaData.id) {
      const err = "File hash does not match expected value";
      console.error(err);
      return { err };
    }

    blob.hash = hash;
    blob.name = this.metaData.name;

    console.log("Saving File to DB");

    await FilesDB.addFile(blob);
    console.log("Done!");
  }

  async scan() {
    if (this.isBusy) return "IS BUSY";
    if (this.err) return this.err;
    if (!this.camRef.current) return "CAMERA NOT READY";
    if (this.hasAllParts) return "ALL PARTS READ";

    this.isBusy = true;

    const result = await this._scan();

    this.isBusy = false;

    return result;
  }

  async _scan() {
    if (!this.metaData) {
      return this.readMetaData();
    }

    this.readFilePart();
  }
}

/*{
  "id": "458752366b8b49be422be4bc76a0cb87",
  "name": "BiblePart2KB.txt",
  "type": "text/plain",
  "timestamp": 1617547652039,
  "size": 2000,
  "numParts": 4
}*/
