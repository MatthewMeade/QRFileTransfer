import scanWorker from "worker-loader!../worker.js"; //eslint-disable-line

const workerPool = [];

const MAX_WORKERS = 10;
const MAX_FINISHED_WORKER_AGE = 1000 * 60;
let createdWorkers = 0;

// TODO: Refactor this
class WorkerWrapper {
  constructor() {
    this.worker = new scanWorker();

    // Worker callback handler
    this.worker.onmessage = ({ data }) => {
      this.resolveFn(data); // Resolve hash promise

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

    this.worker.postMessage({ message, type: "scan" }, pass);
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

export const scanImage = async (pixelsArr, width, height) => {
  const worker = await getWorker();
  return await worker.postMessage({ pixelsArr, width, height });
};
