import Worker from './convert.worker';

// eslint-disable-next-line import/prefer-default-export
export async function convertPreset (text) {
  return new Promise((resolve, reject) => {
    const worker = new Worker();
    worker.postMessage(text);
    worker.onmessage = (event) => {
      resolve(event.data);
    };
    setTimeout(() => reject(new Error('Preset conversion timed out')), 15000);
  });
}
