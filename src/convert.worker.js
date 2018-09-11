import {
  splitPreset,
  prepareShader,
  processOptimizedShader,
  createBasePresetFuns
} from 'milkdrop-preset-utils';
import milkdropParser from 'milkdrop-eel-parser';
import GLSLOptimizer from 'glsl-optimizer-js';

async function _convertHLSL (convertURL, text) {
  if (!text) {
    return '';
  }

  const response = await fetch(convertURL, {
    method: 'POST',
    body: JSON.stringify({
      optimize: false,
      shader: text
    })
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }

  const responseBody = await response.json();
  return responseBody.shader;
}

function _optimizeShader (optimizeGLSL, text) {
  if (text.length === 0) {
    return text;
  }

  let optimizedShader = optimizeGLSL(text);
  optimizedShader = processOptimizedShader(optimizedShader);

  return optimizedShader;
}

async function _convertShader (optimizeGLSL, convertURL, text) {
  const shader = prepareShader(text);
  const convertedShader = await _convertHLSL(convertURL, shader);
  const optimizedShader = _optimizeShader(optimizeGLSL, convertedShader);
  return optimizedShader;
}

function _convertPresetBase (presetParts) {
  const parsedPreset = milkdropParser.convert_preset_wave_and_shape(
    presetParts.presetVersion,
    presetParts.presetInit,
    presetParts.perFrame,
    presetParts.perVertex,
    presetParts.shapes,
    presetParts.waves
  );
  const presetMap = createBasePresetFuns(
    parsedPreset,
    presetParts.shapes,
    presetParts.waves
  );

  return presetMap;
}

async function convertPreset (text, convertURL) {
  let mainPresetText = text.split('[preset00]')[1];
  mainPresetText = mainPresetText.replace(/\r\n/g, '\n');

  const presetParts = splitPreset(mainPresetText);

  const optimizeGLSL = await new Promise((resolve) => {
    GLSLOptimizer().then((Module) => {
      const optimize = Module.cwrap('optimize_glsl', 'string', [
        'string',
        'number',
        'number'
      ]);
      resolve(optimize);
    });
  });

  const [presetMap, warpShader, compShader] = await Promise.all([
    _convertPresetBase(presetParts),
    _convertShader(optimizeGLSL, convertURL, presetParts.warp),
    _convertShader(optimizeGLSL, convertURL, presetParts.comp)
  ]);

  return Object.assign({}, presetMap, {
    baseVals: presetParts.baseVals,
    warp: warpShader,
    comp: compShader,
    presetParts
  });
}

async function convertShader (text, convertURL) {
  const optimizeGLSL = await new Promise((resolve) => {
    GLSLOptimizer().then((Module) => {
      const optimize = Module.cwrap('optimize_glsl', 'string', [
        'string',
        'number',
        'number'
      ]);
      resolve(optimize);
    });
  });

  return _convertShader(optimizeGLSL, convertURL, text);
}

/* eslint-disable no-restricted-globals */
self.addEventListener('message', async (event) => {
  try {
    if (event.data.method === 'convertPreset') {
      self.postMessage(await convertPreset(event.data.text, event.data.convertURL));
    } else if (event.data.method === 'convertShader') {
      self.postMessage(await convertShader(event.data.text, event.data.convertURL));
    }
  } catch (e) {
    self.postMessage({ error: e.message });
  }
});
