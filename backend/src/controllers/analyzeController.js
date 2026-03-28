import { analyzeFinancialTruth } from "../services/analyzeService.js";

export const analyzeController = (request, response) => {
  const { profile, transactions } = request.body;

  if (!profile || !transactions) {
    return response.status(400).json({ error: "profile and transactions are required" });
  }

  return response.json(analyzeFinancialTruth({ profile, transactions }));
};
