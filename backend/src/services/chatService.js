const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_KEY ||
  "AIzaSyBaLLrSoh-kEhiseUw_b9g1imh1xjGo8P4";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const buildContextSummary = (context = {}) => {
  const parts = [];

  if (context.persona) {
    parts.push(`User profile: ${context.persona}.`);
  }
  if (typeof context.honestyScore === "number") {
    parts.push(`Behavior score: ${context.honestyScore}/100.`);
  }
  if (typeof context.riskScore === "number") {
    parts.push(`Bank risk score: ${context.riskScore}.`);
  }
  if (typeof context.monthlyIncome === "number") {
    parts.push(`Monthly income: $${Math.round(context.monthlyIncome).toLocaleString()}.`);
  }
  if (typeof context.monthlySavingsGap === "number") {
    parts.push(`Monthly savings gap: $${Math.round(context.monthlySavingsGap).toLocaleString()}.`);
  }
  if (context.topRecommendation) {
    parts.push(`Best next move: ${context.topRecommendation}.`);
  }

  return parts.join(" ");
};

const extractText = (payload) =>
  payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim() || "";

export const getFinanceCoachReply = async ({ messages = [], context = {} }) => {
  const trimmedMessages = messages.slice(-8);
  const contextSummary = buildContextSummary(context);

  const prompt = [
    "You are the floating finance coach inside the Financial Truth Engine app.",
    "Be concise, sharp, plain-English, and public-friendly.",
    "Do not use jargon unless you explain it immediately.",
    "Do not mention that you are Gemini unless asked.",
    "Never fabricate user data. Use only the provided context.",
    "If the question is not answerable from the current context, say that briefly and ask one useful follow-up.",
    "Keep responses between 1 and 4 short paragraphs.",
    contextSummary ? `Current app context: ${contextSummary}` : "Current app context: no profile loaded yet.",
    "Conversation:"
  ];

  for (const message of trimmedMessages) {
    prompt.push(`${message.role === "user" ? "User" : "Assistant"}: ${message.content}`);
  }

  const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt.join("\n")
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 400
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const reply = extractText(payload);

  if (!reply) {
    throw new Error(`Gemini returned an empty response: ${JSON.stringify(payload)}`);
  }

  return reply;
};
