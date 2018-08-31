import milkdropParser from 'milkdrop-eel-parser';
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

export function convertPresetEquations (presetVersion, initEQs, frameEQs, pixelEQs) {
  const parsedPreset = milkdropParser.convert_basic_preset(presetVersion, initEQs, frameEQs, pixelEQs);
  return {
    init_eqs_str: parsedPreset.perFrameInitEQs ? parsedPreset.perFrameInitEQs.trim() : '',
    frame_eqs_str: parsedPreset.perFrameEQs ? parsedPreset.perFrameEQs.trim() : '',
    pixel_eqs_str: parsedPreset.perPixelEQs ? parsedPreset.perPixelEQs.trim() : ''
  };
}

export function convertWaveEquations (presetVersion, initEQs, frameEQs, pointEQs) {
  const parsedPreset = milkdropParser.make_wave_map(presetVersion, {
    init_eqs_str: initEQs,
    frame_eqs_str: frameEQs,
    point_eqs_str: pointEQs
  });
  return {
    init_eqs_str: parsedPreset.perFrameInitEQs ? parsedPreset.perFrameInitEQs.trim() : '',
    frame_eqs_str: parsedPreset.perFrameEQs ? parsedPreset.perFrameEQs.trim() : '',
    point_eqs_str: parsedPreset.perPointEQs ? parsedPreset.perPointEQs.trim() : ''
  };
}

export function convertShapeEquations (presetVersion, initEQs, frameEQs) {
  const parsedPreset = milkdropParser.make_shape_map(presetVersion, {
    init_eqs_str: initEQs,
    frame_eqs_str: frameEQs
  });
  return {
    init_eqs_str: parsedPreset.perFrameInitEQs ? parsedPreset.perFrameInitEQs.trim() : '',
    frame_eqs_str: parsedPreset.perFrameEQs ? parsedPreset.perFrameEQs.trim() : ''
  };
}
