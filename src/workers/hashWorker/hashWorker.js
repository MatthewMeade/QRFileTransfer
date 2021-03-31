import { hashArrayBuffer } from "./util";

onmessage = ({ data }) => postMessage({ hash: hashArrayBuffer(data) });
