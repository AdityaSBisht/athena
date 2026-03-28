import { simulateFuture } from "../services/simulationService.js";

export const simulateController = (request, response) => {
  const { profile, transactions } = request.body;

  if (!profile || !transactions) {
    return response.status(400).json({ error: "profile and transactions are required" });
  }

  return response.json(simulateFuture({ profile, transactions }));
};
