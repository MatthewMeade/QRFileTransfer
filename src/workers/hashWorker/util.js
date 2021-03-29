import md5 from "crypto-js/md5";
import CryptoJS from "crypto-js";

export const hashBuffer = (aB) => {
  const fWA = CryptoJS.lib.WordArray.create(aB);
  const hWA = md5(fWA);
  return hWA.toString();
};
