import { getInvestShiftMeta, getInvestShiftProjection } from "../services/investShiftService.js";

export const investShiftMetaController = async (_request, response) => {
  const meta = await getInvestShiftMeta();
  return response.json(meta);
};

export const investShiftProjectionController = (request, response) => {
  return response.json(getInvestShiftProjection(request.body || {}));
};
