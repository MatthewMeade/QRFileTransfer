import { hashBuffer } from "./util";

onmessage = ({ data }) => postMessage({ hash: hashBuffer(data) });
