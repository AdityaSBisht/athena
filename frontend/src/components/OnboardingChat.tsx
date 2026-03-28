import { useEffect, useMemo, useRef, useState } from "react";
import {
  createIntakeProfile,
  fetchNextIntakeTurn,
  interpretIntakeMessage,
  type IntakeQuestion,
  type IntakeTurnResponse
} from "../lib/api";
import type { UserPayload } from "../types/finance";
import type { OnboardingAnswers, SpendingDetailAnswers } from "../types/onboarding";

interface OnboardingChatProps {
  onComplete: (payload: UserPayload) => Promise<void>;
}

interface AnsweredEntry {
  key: keyof OnboardingAnswers;
  prompt: string;
  preview: string;
}

const clarificationCopy: Partial<Record<keyof OnboardingAnswers, string>> = {
  monthlyIncome: "Use take-home income after tax. If your income swings, answer with a realistic average month.",
  currentSavings: "Use liquid savings or reserves you could actually access if needed.",
  monthlySavingsGoal: "This is the amount you believe you should save each month, even if your actual behavior is lower.",
  hasDebt: "Debt can mean credit cards, student loans, auto loans, mortgages, or multiple types. If any of those apply, say yes.",
  monthlyDebtPayments: "Use the monthly amount you actually pay across the debts you want the engine to factor in.",
  debtBalance: "Use the current remaining balance. If you have multiple debts, combine them into one total.",
  cashBufferMonths: "Estimate how many months of normal life your current savings could cover if income stopped."
};

export const OnboardingChat = ({ onComplete }: OnboardingChatProps) => {
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [answeredEntries, setAnsweredEntries] = useState<AnsweredEntry[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<IntakeQuestion | null>(null);
  const [progress, setProgress] = useState({ current: 1, total: 11 });
  const [guidance, setGuidance] = useState("I’ll clarify vague answers before I calculate anything.");
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<IntakeTurnResponse["pendingConfirmation"] | null>(null);
  const [completedAnswers, setCompletedAnswers] = useState<OnboardingAnswers | null>(null);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const [spendingDrafts, setSpendingDrafts] = useState<Record<keyof SpendingDetailAnswers, string>>({
    housing: "",
    food: "",
    shopping: "",
    entertainment: "",
    travel: "",
    transport: ""
  });
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  const canContinue = useMemo(() => {
    if (!activeQuestion) {
      return false;
    }

    if (activeQuestion.type === "choice") {
      return true;
    }

    return draft.trim().length > 0;
  }, [activeQuestion, draft]);

  useEffect(() => {
    const bootstrapConversation = async () => {
      const response = await fetchNextIntakeTurn();
      setActiveQuestion(response.question ?? null);
      setProgress(response.progress);
      setGuidance(response.guidance ?? "I’ll clarify vague answers before I calculate anything.");
      setPendingConfirmation(response.pendingConfirmation ?? null);
    };

    void bootstrapConversation();
  }, []);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [activeQuestion, answeredEntries, isAssistantTyping, assistantReply]);

  const submitMessage = async (message: string) => {
    if (!activeQuestion || isAssistantTyping || completedAnswers) {
      return;
    }

    setDraft("");
    setAssistantReply(null);
    setIsAssistantTyping(true);

    window.setTimeout(async () => {
      const turn = await interpretIntakeMessage(answers, message, pendingConfirmation);
      const acceptedAnswer = turn.acceptedAnswer;

      if (acceptedAnswer) {
        setAnsweredEntries((current) => [
          ...current,
          {
            key: acceptedAnswer.key,
            prompt: acceptedAnswer.prompt,
            preview: acceptedAnswer.preview
          }
        ]);
        setPendingConfirmation(null);
      }

      if (turn.status === "complete") {
        setCompletedAnswers(turn.answers as OnboardingAnswers);
        setShowExpenseDetails(true);
        setActiveQuestion(null);
        setAssistantReply("Tell me all your monthly expenses so I can show exactly where your money goes and where it is leaking.");
        setIsAssistantTyping(false);
        return;
      }

      setAnswers(turn.answers);
      setActiveQuestion(turn.question ?? null);
      setProgress(turn.progress);
      setGuidance(turn.guidance ?? "I’ll clarify vague answers before I calculate anything.");
      setAssistantReply(turn.assistantMessage ?? null);
      setPendingConfirmation(turn.pendingConfirmation ?? null);
      setIsAssistantTyping(false);
    }, 700);
  };

  const finalizeProfile = async () => {
    if (!completedAnswers) {
      return;
    }

    const detailAnswers: SpendingDetailAnswers = {
      housing: Math.max(Number(spendingDrafts.housing) || 0, 0),
      food: Math.max(Number(spendingDrafts.food) || 0, 0),
      shopping: Math.max(Number(spendingDrafts.shopping) || 0, 0),
      entertainment: Math.max(Number(spendingDrafts.entertainment) || 0, 0),
      travel: Math.max(Number(spendingDrafts.travel) || 0, 0),
      transport: Math.max(Number(spendingDrafts.transport) || 0, 0)
    };

    setIsSubmitting(true);
    try {
      const payload = await createIntakeProfile(completedAnswers, detailAnswers);
      await onComplete(payload);
    } finally {
      setIsSubmitting(false);
      setIsAssistantTyping(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-[#d4af37]">AI Intake Chat</p>
          <h3 className="mt-2 text-3xl font-semibold leading-tight text-white">
            Tell me about your finances in plain English
          </h3>
          <p className="mt-3 max-w-2xl text-slate-300">
            You can answer directly or ask a clarification question. I’ll keep tightening the profile until it’s clear enough to calculate.
          </p>
        </div>

        <div className="min-w-[240px] rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Conversation progress</span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#fefce8] transition-all duration-500"
              style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-300">{guidance}</p>
        </div>
      </div>

      <div className="mt-6 h-[34rem] overflow-y-auto rounded-[1.8rem] border border-white/10 bg-gradient-to-b from-black/40 to-black/20 p-5">
        <div className="space-y-4">
          <div className="max-w-[88%] rounded-[1.5rem] rounded-tl-sm border border-[#2a2510] bg-[#1f1a00] p-4 shadow-glow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af37] text-sm font-semibold text-[#0c0c0c]">
                TE
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Truth Engine</p>
            </div>
            <p className="mt-2 text-base leading-7 text-white">
              If you say something broad like debt, mixed income, or “does this include entertainment?”, I’ll answer and keep the intake moving without forcing fake certainty.
            </p>
          </div>

          {answeredEntries.map((entry, index) => (
            <div key={`${entry.key}-${index}`} className="animate-slideup">
              <div className="max-w-[88%] rounded-[1.5rem] rounded-tl-sm border border-white/10 bg-white/5 p-4">
                <p className="text-base leading-7 text-white">{entry.prompt}</p>
              </div>
              <div className="mt-3 flex justify-end">
                <div className="max-w-[78%] rounded-[1.5rem] rounded-tr-sm bg-[#d4af37] px-5 py-4 text-right text-[#0c0c0c] shadow-glow">
                  <p className="text-base font-medium">{entry.preview}</p>
                </div>
              </div>
            </div>
          ))}

          {isAssistantTyping ? (
            <div className="max-w-[88%] animate-slideup rounded-[1.5rem] rounded-tl-sm border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                  AI
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Truth Engine is interpreting
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#d4af37]" />
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#d4af37] [animation-delay:140ms]" />
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#d4af37] [animation-delay:280ms]" />
              </div>
            </div>
          ) : (
            <div className="max-w-[88%] animate-slideup rounded-[1.5rem] rounded-tl-sm border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                  AI
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Question {progress.current} of {progress.total}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[#d4af37]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#d4af37]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#d4af37] [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#d4af37] [animation-delay:240ms]" />
                <span className="ml-2 text-xs uppercase tracking-[0.28em] text-slate-500">Assistant is guiding</span>
              </div>
              <p className="mt-3 text-lg leading-7 text-white">{activeQuestion?.prompt}</p>
            </div>
          )}

          {assistantReply ? (
            <div className="max-w-[88%] animate-slideup rounded-[1.5rem] rounded-tl-sm border border-amber-400/20 bg-amber-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-200">
                {pendingConfirmation ? "Interpretation Check" : "Clarification"}
              </p>
              <p className="mt-2 text-base leading-7 text-white">{assistantReply}</p>
            </div>
          ) : null}

          <div ref={bottomAnchorRef} />
        </div>
      </div>

      <div className="mt-5">
        {showExpenseDetails ? (
          <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-signal-accent/70">Expense Breakdown</p>
            <h4 className="mt-2 text-2xl font-semibold text-white">Tell me all your monthly expenses</h4>
            <p className="mt-3 max-w-2xl text-slate-300">
              Give me rough monthly amounts for these categories. Then I can show the breakdown clearly and point to the real leak instead of guessing.
            </p>

            <div className="mt-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {([
                  ["housing", "Rent + bills"],
                  ["food", "Food"],
                  ["shopping", "Shopping"],
                  ["entertainment", "Entertainment"],
                  ["travel", "Travel"],
                  ["transport", "Transport"]
                ] as Array<[keyof SpendingDetailAnswers, string]>).map(([key, label]) => (
                  <label key={key} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">{label}</p>
                    <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-3">
                      <span className="text-slate-500">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={spendingDrafts[key]}
                        onChange={(event) =>
                          setSpendingDrafts((current) => ({
                            ...current,
                            [key]: event.target.value.replace(/[^\d]/g, "")
                          }))
                        }
                        placeholder="0"
                        className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void finalizeProfile()}
                  disabled={isSubmitting}
                  className="rounded-full bg-[#d4af37] px-5 py-3 font-semibold text-[#0c0c0c] transition hover:bg-[#fefce8] disabled:opacity-50"
                >
                  {isSubmitting ? "Building..." : "Analyze my report"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {!showExpenseDetails ? (
          <>
        {activeQuestion?.type === "choice" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {activeQuestion.options?.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => void submitMessage(option.value)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left text-white transition hover:-translate-y-0.5 hover:border-[#2a2510] hover:bg-white/10"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Quick reply</p>
                <p className="mt-2 text-lg">{option.label}</p>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canContinue && !isAssistantTyping) {
                event.preventDefault();
                void submitMessage(draft);
              }
            }}
            placeholder={activeQuestion?.placeholder ?? "Type your answer or ask a clarification question"}
            className="flex-1 rounded-full border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition focus:border-[#2a2510] disabled:opacity-50"
            disabled={isAssistantTyping || isSubmitting}
          />
          <button
            type="button"
            disabled={!canContinue || isSubmitting || isAssistantTyping}
            onClick={() => void submitMessage(draft)}
            className="rounded-full bg-[#d4af37] px-6 py-4 font-semibold text-[#0c0c0c] transition hover:bg-[#fefce8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAssistantTyping ? "Thinking..." : isSubmitting ? "Building..." : "Send"}
          </button>
        </div>

        {pendingConfirmation ? (
          <div className="mt-3 rounded-[1.2rem] border border-[#2a2510] bg-[#1f1a00] px-4 py-4 text-sm text-slate-200">
            <p>
              Confirm this read, or hit no and type the corrected value naturally.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void submitMessage("yes")}
                disabled={isSubmitting || isAssistantTyping}
                className="rounded-full bg-[#d4af37] px-5 py-2.5 font-semibold text-[#0c0c0c] transition hover:bg-[#fefce8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Yes, that is right
              </button>
              <button
                type="button"
                onClick={() => void submitMessage("no")}
                disabled={isSubmitting || isAssistantTyping}
                className="rounded-full border border-white/15 bg-black/30 px-5 py-2.5 font-semibold text-white transition hover:border-signal-bad/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                No, let me fix it
              </button>
            </div>
          </div>
        ) : null}

        {activeQuestion && clarificationCopy[activeQuestion.key] ? (
          <button
            type="button"
            onClick={() => setAssistantReply(clarificationCopy[activeQuestion.key] ?? null)}
            className="mt-3 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            What counts here?
          </button>
        ) : null}
          </>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full border border-white/10 px-3 py-1">Free text allowed</span>
        <span className="rounded-full border border-white/10 px-3 py-1">Income structure</span>
        <span className="rounded-full border border-white/10 px-3 py-1">Debt clarity</span>
        <span className="rounded-full border border-white/10 px-3 py-1">Goal context</span>
      </div>
    </div>
  );
};
