import { scanImage, hashArrayBuffer } from "./util";

onmessage = async ({ data }) => {
  if (data.type === "hash") {
    return postMessage({ hash: hashArrayBuffer(data.message) });
  }

  if (data.type === "scan") {
    const { pixelsArr, width, height } = data.message;
    const result = await scanImage(pixelsArr, width, height, {
      inversionAttempts: "dontInvert",
    });
    postMessage(result);
  }
};
