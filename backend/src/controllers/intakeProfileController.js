import { buildIntakeProfile } from "../services/intakeProfileService.js";
import {
  getNextIntakeTurn,
  interpretIntakeMessage
} from "../services/intakeConversationService.js";

export const intakeProfileController = (request, response) => {
  const { answers, spendingDetails } = request.body;

  if (!answers) {
    return response.status(400).json({ error: "answers are required" });
  }

  return response.json(buildIntakeProfile(answers, spendingDetails));
};

export const intakeConversationController = (request, response) => {
  const { answers } = request.body || {};
  return response.json(getNextIntakeTurn(answers));
};

export const intakeInterpretController = (request, response) => {
  const { answers, message, pendingConfirmation } = request.body || {};

  if (!message) {
    return response.status(400).json({ error: "message is required" });
  }

  return response.json(interpretIntakeMessage({ answers, message, pendingConfirmation }));
};
