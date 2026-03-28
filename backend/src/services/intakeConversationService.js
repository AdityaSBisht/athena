const toTitleCase = (value = "") =>
  String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const blockedOccupationTerms = [
  "dumb",
  "dumbass",
  "idiot",
  "stupid",
  "moron",
  "loser",
  "fuck",
  "shit",
  "bitch",
  "asshole"
];

const normalizeAnswers = (answers = {}) => {
  const normalized = { ...answers };

  if (typeof normalized.occupation === "string") {
    normalized.occupation = toTitleCase(normalized.occupation);
  }

  if (typeof normalized.hasDebt === "string") {
    normalized.hasDebt = normalized.hasDebt === "yes";
  }

  return normalized;
};

const formatMoney = (value) => `$${Number(value).toLocaleString()}`;
const confirmationRequiredKeys = new Set([
  "monthlyIncome",
  "currentSavings",
  "monthlySavingsGoal",
  "monthlyDebtPayments",
  "debtBalance"
]);

const baseQuestions = [
  {
    key: "occupation",
    prompt: "Let's build your financial profile properly. First, what's your profession?",
    type: "text",
    placeholder: "Founder, product designer, software engineer..."
  },
  {
    key: "age",
    prompt: "How old are you?",
    type: "number",
    min: 18,
    step: 1,
    placeholder: "29"
  },
  {
    key: "incomeType",
    prompt: "How does your income usually come in?",
    type: "choice",
    options: [
      { label: "Mostly salary", value: "salary" },
      { label: "Mostly freelance", value: "freelance" },
      { label: "Mixed income", value: "mixed" }
    ]
  },
  {
    key: "monthlyIncome",
    prompt: "What's your typical monthly take-home income?",
    type: "number",
    min: 0,
    step: 100,
    placeholder: "6200"
  },
  {
    key: "currentSavings",
    prompt: "How much do you currently have in savings or liquid net worth?",
    type: "number",
    min: 0,
    step: 500,
    placeholder: "18000"
  },
  {
    key: "monthlySavingsGoal",
    prompt: "How much do you think you should be saving each month?",
    type: "number",
    min: 0,
    step: 50,
    placeholder: "1200"
  },
  {
    key: "hasDebt",
    prompt: "Do you currently have any debt I should factor in?",
    type: "choice",
    options: [
      { label: "No debt", value: "no" },
      { label: "Yes, some debt", value: "yes" }
    ]
  },
  {
    key: "cashBufferMonths",
    prompt: "How many months could your savings cover your life if income stopped?",
    type: "number",
    min: 0,
    step: 0.5,
    placeholder: "3"
  },
  {
    key: "riskTolerance",
    prompt: "How would you describe your investing risk tolerance?",
    type: "choice",
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" }
    ]
  },
  {
    key: "primaryGoal",
    prompt: "What's your biggest money goal right now?",
    type: "choice",
    options: [
      { label: "Emergency fund", value: "Build a stronger emergency fund" },
      { label: "Pay off debt", value: "Pay off debt faster" },
      { label: "Invest more", value: "Increase long-term investing" }
    ]
  }
];

const debtQuestions = [
  {
    key: "debtType",
    prompt: "What kind of debt is this? Pick one. If it is just credit card debt, tap Credit card.",
    type: "choice",
    options: [
      { label: "Credit card debt", value: "credit-card" },
      { label: "Student loan", value: "student-loan" },
      { label: "Car loan", value: "auto-loan" },
      { label: "Mortgage", value: "mortgage" },
      { label: "More than one type", value: "multiple" }
    ]
  },
  {
    key: "monthlyDebtPayments",
    prompt: "About how much are you paying toward that debt each month?",
    type: "number",
    min: 0,
    step: 25,
    placeholder: "320"
  },
  {
    key: "debtBalance",
    prompt: "What's the current total balance on that debt?",
    type: "number",
    min: 0,
    step: 100,
    placeholder: "12000"
  }
];

const buildQuestionFlow = (answers) => {
  const flow = [...baseQuestions];
  const debtInsertIndex = flow.findIndex((question) => question.key === "cashBufferMonths");

  if (answers.hasDebt === true) {
    flow.splice(debtInsertIndex, 0, ...debtQuestions);
  }

  return flow;
};

export const getNextIntakeTurn = (answers = {}) => {
  const normalizedAnswers = normalizeAnswers(answers);

  if (normalizedAnswers.hasDebt === false) {
    normalizedAnswers.debtType = "none";
    normalizedAnswers.monthlyDebtPayments = 0;
    normalizedAnswers.debtBalance = 0;
  }

  const flow = buildQuestionFlow(normalizedAnswers);
  const nextQuestion = flow.find((question) => {
    const value = normalizedAnswers[question.key];
    return value === undefined || value === null || value === "";
  });

  const answeredCount = flow.filter((question) => {
    const value = normalizedAnswers[question.key];
    return value !== undefined && value !== null && value !== "";
  }).length;

  if (!nextQuestion) {
    return {
      status: "complete",
      answers: normalizedAnswers,
      progress: {
        current: flow.length,
        total: flow.length
      }
    };
  }

  if (nextQuestion.key === "monthlyIncome" && normalizedAnswers.incomeType) {
    const promptByIncomeType = {
      salary: "What's your monthly take-home pay from salary after tax?",
      freelance: "What's a realistic average month of take-home freelance income?",
      mixed: "What's your blended monthly take-home income across salary and side income?"
    };
    nextQuestion.prompt = promptByIncomeType[normalizedAnswers.incomeType] || nextQuestion.prompt;
  }

  if (nextQuestion.key === "monthlyDebtPayments" && normalizedAnswers.debtType) {
    const debtLabel = normalizedAnswers.debtType === "multiple"
      ? "all of those debts together"
      : normalizedAnswers.debtType.replace("-", " ");
    nextQuestion.prompt = `About how much are you paying toward ${debtLabel} each month?`;
  }

  if (nextQuestion.key === "debtBalance" && normalizedAnswers.debtType) {
    const debtLabel = normalizedAnswers.debtType === "multiple"
      ? "those debts combined"
      : normalizedAnswers.debtType.replace("-", " ");
    nextQuestion.prompt = `What's the current total balance on ${debtLabel}?`;
  }

  return {
    status: "question",
    answers: normalizedAnswers,
    question: nextQuestion,
    progress: {
      current: answeredCount + 1,
      total: flow.length
    },
    guidance:
      normalizedAnswers.hasDebt === true
        ? "I'll clarify debt type and amount so the engine doesn't flatten everything into one vague debt bucket."
        : "I'll keep filling the profile one concrete financial signal at a time."
  };
};

export const getAnswerPreview = (key, value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (["monthlyIncome", "fixedExpenses", "currentSavings", "monthlySavingsGoal", "monthlyDebtPayments", "debtBalance"].includes(key)) {
    return `${formatMoney(value)}${key === "monthlyIncome" ? "/month" : ""}`;
  }

  if (key === "cashBufferMonths") {
    return `${value} months`;
  }

  if (key === "occupation") {
    return toTitleCase(value);
  }

  if (key === "hasDebt") {
    return value ? "Yes, some debt" : "No debt";
  }

  if (key === "debtType") {
    const labels = {
      "credit-card": "Credit card debt",
      "student-loan": "Student loan",
      "auto-loan": "Car loan",
      mortgage: "Mortgage",
      multiple: "More than one debt type",
      none: "No debt"
    };

    return labels[value] || "Debt";
  }

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const parseNumber = (message) => {
  const text = String(message).trim().toLowerCase();

  if (!text) {
    return null;
  }

  const normalized = text
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\bgrand\b/g, " thousand");

  const compactSuffixMatch = normalized.match(/(-?\d+(?:\.\d+)?)([kmb])\b/);

  if (compactSuffixMatch) {
    const compactMultiplierBySuffix = {
      k: 1_000,
      m: 1_000_000,
      b: 1_000_000_000
    };

    const compactValue = Number(compactSuffixMatch[1]);
    const compactMultiplier = compactMultiplierBySuffix[compactSuffixMatch[2]] || 1;

    if (!Number.isNaN(compactValue)) {
      return Math.round(compactValue * compactMultiplier * 100) / 100;
    }
  }

  const match = normalized.match(/(-?\d+(?:\.\d+)?)\s*(thousand|million|billion)?/);

  if (!match) {
    return null;
  }

  const baseValue = Number(match[1]);

  if (Number.isNaN(baseValue)) {
    return null;
  }

  const multiplierByWord = {
    thousand: 1_000,
    million: 1_000_000,
    billion: 1_000_000_000
  };

  const multiplier = multiplierByWord[match[2]] || 1;
  return Math.round(baseValue * multiplier * 100) / 100;
};

const isClarificationQuestion = (message) => {
  const text = String(message).toLowerCase();
  return (
    text.includes("?") ||
    text.includes("include") ||
    text.includes("including") ||
    text.includes("what counts") ||
    text.includes("as in") ||
    text.includes("do i count") ||
    text.includes("does this mean")
  );
};

const buildClarificationReply = (questionKey) => {
  const replies = {
    occupation: "Give me the role that best describes how you work, like Founder, Software Engineer, Product Designer, Consultant, or Student.",
    age: "Give me your current age in years. I only use it as lightweight context, not as a judgment signal.",
    monthlyIncome: "Use take-home income after tax. If your income changes month to month, give me a realistic average month.",
    currentSavings: "Use liquid savings or cash-like reserves you could access without selling long-term investments.",
    monthlySavingsGoal: "Use the amount you believe you should save each month, even if your actual behavior is lower right now.",
    hasDebt: "Debt can mean credit cards, student loans, auto loans, mortgages, or multiple types. If you have any of those, say yes and I’ll break it down.",
    monthlyDebtPayments: "Use the amount you actually pay each month across all debts that matter to your cash flow.",
    debtBalance: "Use the current total balance remaining. If you have multiple debts, combine them.",
    cashBufferMonths: "Estimate how many months of normal life your current savings could cover if income stopped tomorrow.",
    incomeType: "Pick the income pattern that best matches real life: salary, freelance, or mixed.",
    debtType: "Pick the one that fits best. If you only have credit card debt, choose Credit card debt. Choose more than one type only if you truly have several debts.",
    riskTolerance: "Low means you prefer stability, medium means balanced, and high means you can tolerate bigger swings for higher upside.",
    primaryGoal: "Choose the goal that matters most right now: stronger safety cushion, paying debt down, or investing more."
  };

  return replies[questionKey] || "Answer in the way that best reflects your current real-life monthly situation, and I’ll adjust from there.";
};

const isAssistanceRequest = (message) => {
  const text = String(message).trim().toLowerCase();
  return /^(help|idk|i don't know|dont know|not sure|unsure|example|examples)$/i.test(text);
};

const isPositiveConfirmation = (message) =>
  /^(yes|y|yeah|yep|correct|right|exactly|that works|sounds right|looks right|confirm)$/i.test(
    String(message).trim().toLowerCase()
  );

const isNegativeConfirmation = (message) =>
  /^(no|n|nope|nah|not quite|incorrect|wrong|change it|edit)$/i.test(
    String(message).trim().toLowerCase()
  );

const parseChoiceValue = (questionKey, message) => {
  const text = String(message).toLowerCase();

  if (questionKey === "incomeType") {
    if (text.includes("mix")) return "mixed";
    if (text.includes("free")) return "freelance";
    if (text.includes("salary") || text.includes("job") || text.includes("payroll")) return "salary";
  }

  if (questionKey === "hasDebt") {
    if (/\b(no|none|nah|nope)\b/.test(text)) return false;
    if (/\b(yes|yeah|yep|some|i do|have debt)\b/.test(text)) return true;
  }

  if (questionKey === "debtType") {
    const matches = [
      text.includes("credit") || text.includes("card"),
      text.includes("student"),
      text.includes("auto") || /\bcar\b/.test(text),
      text.includes("mortgage"),
    ].filter(Boolean).length;

    if (matches > 1 || text.includes("multiple")) return "multiple";
    if (text.includes("credit") || text.includes("card")) return "credit-card";
    if (text.includes("student")) return "student-loan";
    if (text.includes("auto") || /\bcar\b/.test(text)) return "auto-loan";
    if (text.includes("mortgage")) return "mortgage";
  }

  if (questionKey === "riskTolerance") {
    if (text.includes("low") || text.includes("safe") || text.includes("conservative")) return "low";
    if (text.includes("high") || text.includes("aggressive")) return "high";
    if (text.includes("medium") || text.includes("balanced") || text.includes("moderate")) return "medium";
  }

  if (questionKey === "primaryGoal") {
    if (text.includes("emergency")) return "Build a stronger emergency fund";
    if (text.includes("debt")) return "Pay off debt faster";
    if (text.includes("invest")) return "Increase long-term investing";
  }

  return null;
};

const validateOccupation = (message) => {
  const trimmed = String(message).trim();
  const lowered = trimmed.toLowerCase();

  if (!trimmed) {
    return { ok: false, reason: "empty" };
  }

  if (blockedOccupationTerms.some((term) => lowered.includes(term))) {
    return { ok: false, reason: "invalid_occupation" };
  }

  if (trimmed.length < 2 || trimmed.length > 60) {
    return { ok: false, reason: "invalid_occupation" };
  }

  if (!/[a-z]/i.test(trimmed)) {
    return { ok: false, reason: "invalid_occupation" };
  }

  return { ok: true, value: toTitleCase(trimmed) };
};

const parseAnswerForQuestion = (question, message) => {
  if (!question) {
    return { ok: false };
  }

  if (question.type === "text") {
    if (question.key === "occupation") {
      return validateOccupation(message);
    }

    return {
      ok: true,
      value: String(message).trim()
    };
  }

  if (question.type === "number") {
    const parsed = parseNumber(message);
    return parsed === null ? { ok: false } : { ok: true, value: parsed };
  }

  const choice = parseChoiceValue(question.key, message);
  return choice === null ? { ok: false } : { ok: true, value: choice };
};

const buildConfirmationMessage = (question, value) => {
  const preview = getAnswerPreview(question.key, value);

  if (question.key === "monthlyIncome") {
    return `Understood as ${preview}. I’ll use that as your average take-home month unless you want to correct it. Reply yes to confirm.`;
  }

  if (question.key === "fixedExpenses") {
    return `Understood as ${preview} in required monthly bills. Reply yes to confirm, or correct me if that should be different.`;
  }

  return `I understood ${question.key.replace(/([A-Z])/g, " $1").toLowerCase()} as ${preview}. Reply yes to confirm, or correct me.`;
};

const commitAcceptedAnswer = (currentTurn, question, value) => {
  const nextAnswers = {
    ...currentTurn.answers,
    [question.key]: value
  };
  const nextTurn = getNextIntakeTurn(nextAnswers);

  return {
    ...nextTurn,
    acceptedAnswer: {
      key: question.key,
      prompt: question.prompt,
      value,
      preview: getAnswerPreview(question.key, value)
    }
  };
};

const buildAssistanceReply = (question, message = "") => {
  const text = String(message).trim().toLowerCase();

  if (!question) {
    return "How can I help? Tell me what feels unclear and I’ll tighten it up with you.";
  }

  if (/^help$/i.test(text)) {
    return `How can I help with this question? I’m asking about ${question.key.replace(/([A-Z])/g, " $1").toLowerCase()}. You can ask what counts, ask for an example, or just answer in your own words.`;
  }

  if (/^(example|examples)$/i.test(text)) {
    return `Sure. ${buildClarificationReply(question.key)}${question.placeholder ? ` Example answer: ${question.placeholder}.` : ""}`;
  }

  return `${buildClarificationReply(question.key)} ${question.placeholder ? `For example: ${question.placeholder}.` : ""}`.trim();
};

export const interpretIntakeMessage = ({ answers = {}, message, pendingConfirmation = null }) => {
  const currentTurn = getNextIntakeTurn(answers);

  if (currentTurn.status === "complete") {
    return currentTurn;
  }

  const currentQuestion = pendingConfirmation?.key
    ? buildQuestionFlow(currentTurn.answers).find((question) => question.key === pendingConfirmation.key) || currentTurn.question
    : currentTurn.question;

  if (pendingConfirmation && currentQuestion) {
    if (isPositiveConfirmation(message)) {
      return commitAcceptedAnswer(currentTurn, currentQuestion, pendingConfirmation.value);
    }

    if (isClarificationQuestion(message) || isAssistanceRequest(message)) {
      return {
        ...currentTurn,
        question: currentQuestion,
        pendingConfirmation,
        assistantMessage: `${buildAssistanceReply(currentQuestion, message)} I currently have ${getAnswerPreview(currentQuestion.key, pendingConfirmation.value)} queued for this field.`
      };
    }

    if (isNegativeConfirmation(message)) {
      return {
        ...currentTurn,
        question: currentQuestion,
        assistantMessage: `No problem. Give me the corrected ${currentQuestion.key.replace(/([A-Z])/g, " $1").toLowerCase()} and I’ll re-read it.`
      };
    }

    const reparsed = parseAnswerForQuestion(currentQuestion, message);

    if (!reparsed.ok) {
      return {
        ...currentTurn,
        question: currentQuestion,
        pendingConfirmation,
        assistantMessage: `I still have ${getAnswerPreview(currentQuestion.key, pendingConfirmation.value)} queued. If that’s wrong, send the corrected value in plain English and I’ll update it.`
      };
    }

    return {
      ...currentTurn,
      question: currentQuestion,
      pendingConfirmation: {
        key: currentQuestion.key,
        value: reparsed.value
      },
      assistantMessage: buildConfirmationMessage(currentQuestion, reparsed.value)
    };
  }

  if (isClarificationQuestion(message) || isAssistanceRequest(message)) {
    return {
      ...currentTurn,
      assistantMessage: buildAssistanceReply(currentQuestion, message)
    };
  }

  const parsed = parseAnswerForQuestion(currentQuestion, message);

  if (!parsed.ok) {
    if (currentQuestion.key === "occupation" && parsed.reason === "invalid_occupation") {
      return {
        ...currentTurn,
        assistantMessage: "I need your actual profession or role here, not an insult or throwaway text. Something like Founder, Software Engineer, Consultant, Student, or Product Designer works."
      };
    }

    return {
      ...currentTurn,
      assistantMessage: `I couldn't confidently map that to ${currentQuestion.key.replace(/([A-Z])/g, " $1").toLowerCase()}. ${buildClarificationReply(currentQuestion.key)}`
    };
  }

  if (confirmationRequiredKeys.has(currentQuestion.key)) {
    return {
      ...currentTurn,
      pendingConfirmation: {
        key: currentQuestion.key,
        value: parsed.value
      },
      assistantMessage: buildConfirmationMessage(currentQuestion, parsed.value)
    };
  }

  return commitAcceptedAnswer(currentTurn, currentQuestion, parsed.value);
};
