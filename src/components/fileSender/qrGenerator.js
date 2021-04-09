import QRCode from "qrcode";
import FilesDB from "../../FilesDB";

const qrOptions = {
  errorCorrectionLevel: "L",
  type: "image/png",
  quality: 1,
  margin: 1,
};

export const PART_SIZE = 500;
export default async function generateQRCodes(fileIDs) {
  const files = await FilesDB.getFilesByID(fileIDs);

  return Promise.all(
    files.map(async (f) => {
      const ab = await f.data.arrayBuffer();
      const steps = Math.ceil(ab.byteLength / PART_SIZE);

      const metaCode = await QRCode.toDataURL(JSON.stringify({ ...f.metaData, numParts: steps }), qrOptions);

      const promises = [];
      for (let i = 0; i < steps; i++) {
        const fileData = new Uint8ClampedArray(ab.slice(i * PART_SIZE, (i + 1) * PART_SIZE));
        const partData = new Uint8ClampedArray(fileData.length + 3);

        const part = i.toString(2).padStart(24, "0");

        partData[0] = parseInt(part.slice(0, 8), 2);
        partData[1] = parseInt(part.slice(8, 16), 2);
        partData[2] = parseInt(part.slice(16, 24), 2);

        partData.set(fileData, 3);

        promises.push(QRCode.toDataURL([{ data: partData, mode: "byte" }], qrOptions));
      }

      console.time("QR Gen");
      const dataCodes = await Promise.all(promises);
      console.timeEnd("QR Gen");

      return { ...f, metaCode, dataCodes };
    })
  );
}
