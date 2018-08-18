import {
  splitPreset,
  prepareShader,
  processOptimizedShader,
  createBasePresetFuns
} from 'milkdrop-preset-utils';
import milkdropParser from 'milkdrop-eel-parser';
import optimizeGLSL from './glslOptimizer';

const CONVERT_URL =
  'https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter';

async function _convertHLSL (text) {
  if (!text) {
    return '';
  }

  const response = await fetch(CONVERT_URL, {
    method: 'POST',
    body: JSON.stringify({
      optimize: false,
      shader: text
    })
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const responseBody = await response.json();
  return responseBody.shader;
}

function _optimizeShader (text) {
  if (text.length === 0) {
    return text;
  }

  let optimizedShader = optimizeGLSL(text);
  optimizedShader = processOptimizedShader(optimizedShader);

  return optimizedShader;
}

async function _convertShader (text) {
  try {
    const shader = prepareShader(text);
    const convertedShader = await _convertHLSL(shader);
    const optimizedShader = _optimizeShader(convertedShader);
    return optimizedShader;
  } catch (e) {
    return '';
  }
}

// eslint-disable-next-line import/prefer-default-export
export async function convertPreset (text) {
  let mainPresetText = text.split('[preset00]')[1];
  mainPresetText = mainPresetText.replace(/\r\n/g, '\n');

  const presetParts = splitPreset(mainPresetText);
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

  const [warpShader, compShader] = await Promise.all([
    _convertShader(presetParts.warp),
    _convertShader(presetParts.comp)
  ]);

  return Object.assign({}, presetMap, {
    baseVals: presetParts.baseVals,
    warp: warpShader,
    comp: compShader
  });
}
