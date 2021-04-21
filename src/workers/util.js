import md5 from "crypto-js/md5";
import CryptoJS from "crypto-js";
import jsQR from "jsqr";

export const hashArrayBuffer = (aB) => {
  const fWA = CryptoJS.lib.WordArray.create(aB);
  const hWA = md5(fWA);
  return hWA.toString();
};

export const scanImage = async (pixelsArr, width, height) => {
  return await jsQR(pixelsArr, width, height);
};
