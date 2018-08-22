import Worker from './convert.worker';

// eslint-disable-next-line import/prefer-default-export
export async function convertPreset (text) {
  return new Promise((resolve) => {
    const worker = new Worker();
    worker.postMessage(text);
    worker.onmessage = (event) => {
      resolve(event.data);
    };
  });
}
