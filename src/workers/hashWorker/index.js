import hashWorker from "worker-loader!../worker.js"; //eslint-disable-line
import { hashArrayBuffer } from "../util";

const workerPool = [];

const LOG_TIME = true;
const HASH_BATCH_SIZE = 1e7;
const MAX_WORKERS = 10;
const MAX_FINISHED_WORKER_AGE = 1000 * 60;
let createdWorkers = 0;

// TODO: Refactor wrapper class
class WorkerWrapper {
  constructor() {
    this.worker = new hashWorker();

    // Worker callback handler
    this.worker.onmessage = ({ data: { hash } }) => {
      this.resolveFn(hash); // Resolve hash promise

      // Return worker to pool and start kill timer
      workerPool.push(this);
      this.killTimeout = setTimeout(() => {
        this.worker.terminate();
        createdWorkers--;
      }, MAX_FINISHED_WORKER_AGE);
    };

    createdWorkers++;
  }

  postMessage(message, pass) {
    clearTimeout(this.killTimeout);

    this.worker.postMessage({ message, type: "hash" }, pass);
    return new Promise((resolve) => {
      this.resolveFn = (hash) => resolve(hash);
    });
  }
}

const wait = (n) => new Promise((res) => setTimeout(() => res(), n));
const getWorker = async () => {
  while (workerPool.length === 0) {
    if (createdWorkers < MAX_WORKERS) return new WorkerWrapper();
    else await wait(50);
  }

  return workerPool.pop();
};

export const hashBlob = async (file) => {
  if (file.size < HASH_BATCH_SIZE) {
    return hashArrayBuffer(await file.arrayBuffer()); // Don't use workers for small files, not worth the overhead
  } else {
    return hashFileBlob(file);
  }
};

const hashFileBlob = async (aBuffer) => {
  const promises = [];

  LOG_TIME && console.time("Hashing");

  for (let i = 0; i < aBuffer.size; i += HASH_BATCH_SIZE) {
    let data = await aBuffer.slice(i, i + HASH_BATCH_SIZE).arrayBuffer();

    const curWorker = await getWorker();
    const hash = curWorker.postMessage(data, [data]);

    promises.push(hash);
  }

  const resolvedHashes = await Promise.all(promises);

  LOG_TIME && console.timeEnd("Hashing");

  return resolvedHashes.join("");
};
