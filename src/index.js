// import {
//   splitPreset,
//   createBasePresetFuns
// } from 'milkdrop-preset-utils';
// import milkdropParser from 'milkdrop-eel-parser';
import Worker from './convert.worker';

const CONVERT_URL =
  'https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter';

export async function convertPreset (text, convertURL = CONVERT_URL) {
  return new Promise((resolve, reject) => {
    const worker = new Worker();
    worker.postMessage({ method: 'convertPreset', text, convertURL });
    worker.onmessage = (event) => {
      resolve(event.data);
    };
    setTimeout(() => reject(new Error('Preset conversion timed out')), 15000);
  });
}

export async function convertShader (text, convertURL = CONVERT_URL) {
  return new Promise((resolve, reject) => {
    const worker = new Worker();
    worker.postMessage({ method: 'convertShader', text, convertURL });
    worker.onmessage = (event) => {
      resolve(event.data);
    };
    setTimeout(() => reject(new Error('Shader conversion timed out')), 15000);
  });
}
