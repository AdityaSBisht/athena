import { getFinanceCoachReply } from "../services/chatService.js";

export const financeCoachController = async (request, response) => {
  try {
    const reply = await getFinanceCoachReply(request.body || {});
    return response.json({ reply });
  } catch (error) {
    console.error("Finance coach error:", error);
    return response.json({
      reply:
        "I can help, but the live AI coach is not responding right now. Ask again in a moment, or use the report and decision pages for the current rule-based breakdown."
    });
  }
};
