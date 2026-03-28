import { generateRiskProfile } from "../services/riskService.js";

export const riskController = (request, response) => {
  const { profile, transactions } = request.body;

  if (!profile || !transactions) {
    return response.status(400).json({ error: "profile and transactions are required" });
  }

  return response.json(generateRiskProfile({ profile, transactions }));
};
