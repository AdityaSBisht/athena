import { applyScenarioPreset } from "../services/scenarioService.js";
import { generateScenarioPresets } from "../services/scenarioService.js";

export const scenarioPresetsController = (request, response) => {
  const { payload } = request.body || {};
  return response.json(generateScenarioPresets(payload));
};

export const scenarioPresetController = (request, response) => {
  const { payload, presetId } = request.body;

  if (!payload?.profile || !payload?.transactions) {
    return response.status(400).json({ error: "payload with profile and transactions is required" });
  }

  if (!presetId) {
    return response.json(payload);
  }

  return response.json(applyScenarioPreset(payload, presetId));
};
