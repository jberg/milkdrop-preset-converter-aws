import Worker from './convert.worker';

const CONVERT_URL =
  'https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter';

// eslint-disable-next-line import/prefer-default-export
export async function convertPreset (text, convertURL = CONVERT_URL) {
  return new Promise((resolve, reject) => {
    const worker = new Worker();
    worker.postMessage({ text, convertURL });
    worker.onmessage = (event) => {
      resolve(event.data);
    };
    setTimeout(() => reject(new Error('Preset conversion timed out')), 15000);
  });
}
