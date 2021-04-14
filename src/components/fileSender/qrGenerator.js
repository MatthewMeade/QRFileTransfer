import QRCode from "qrcode";
import FilesDB from "../../FilesDB";

const qrOptions = {
  errorCorrectionLevel: "L",
  type: "image/webp",
  quality: 1,
  margin: 1,
};

export const PART_SIZE = 500;
export default class QRGenerator {
  constructor(fileID, setmetaDataCode) {
    this.fileID = fileID;
    this.codeCache = [];
    this.setmetaDataCode = setmetaDataCode;

    this.initializeFile();
  }

  get isReady() {
    return !!this.metaDataCode;
  }

  async initializeFile() {
    this.file = await FilesDB.getFileByID(this.fileID);
    this.ab = await this.file.data.arrayBuffer();

    this.totalParts = Math.ceil(this.ab.byteLength / PART_SIZE);
    this.metaDataCode = await QRCode.toDataURL(
      JSON.stringify({ ...this.file.metaData, numParts: this.totalParts }),
      qrOptions
    );

    this.setmetaDataCode(this.metaDataCode);
  }

  async getPartCode(n) {
    if (n < 0) {
      return this.metaDataCode;
    }

    if (this.codeCache[n]) {
      return this.codeCache[n];
    }

    const fileData = new Uint8ClampedArray(this.ab.slice(n * PART_SIZE, (n + 1) * PART_SIZE));
    const partData = new Uint8ClampedArray(fileData.length + 3);

    const part = n.toString(2).padStart(24, "0");

    partData[0] = parseInt(part.slice(0, 8), 2);
    partData[1] = parseInt(part.slice(8, 16), 2);
    partData[2] = parseInt(part.slice(16, 24), 2);

    partData.set(fileData, 3);

    const result = await QRCode.toDataURL([{ data: partData, mode: "byte" }], qrOptions);

    this.codeCache[n] = result;

    return result;
  }
}
