import { useMemo, useState } from "react";
import { askFinanceCoach, type FinanceCoachMessage } from "../lib/api";
import { useDemoScenario } from "../hooks/useDemoScenario";

export const FloatingFinanceCoach = () => {
  const { selectedUser, analysis, riskProfile, decisionEngine } = useDemoScenario();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<FinanceCoachMessage[]>([
    {
      role: "assistant",
      content:
        "I’m your finance coach. Ask me what the numbers mean, where the leak is, or what move matters most."
    }
  ]);

  const context = useMemo(
    () => ({
      persona: selectedUser?.profile.persona,
      honestyScore: analysis?.honestyScore,
      riskScore: riskProfile?.riskScore,
      monthlyIncome: analysis?.metrics.monthlyIncomeObserved,
      monthlySavingsGap: analysis?.metrics.monthlySavingsGap,
      topRecommendation: decisionEngine?.recommendations?.[0]?.title
    }),
    [selectedUser, analysis, riskProfile, decisionEngine]
  );

  const sendMessage = async () => {
    const nextMessage = draft.trim();
    if (!nextMessage || isSending) {
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content: nextMessage }];
    setMessages(nextMessages);
    setDraft("");
    setIsSending(true);

    try {
      const response = await askFinanceCoach({
        messages: nextMessages,
        context
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.reply
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {isOpen ? (
        <div className="w-[22rem] rounded-[1.8rem] border border-[#2a2510] bg-[#161616] shadow-glow">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Finance Coach</p>
              <p className="mt-1 text-sm text-[#a3a3a3]">Powered by Gemini</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-[#1a1a1a] px-3 py-1 text-sm text-[#fefce8] transition hover:bg-[#1f1a00] hover:text-[#d4af37]"
            >
              Close
            </button>
          </div>

          <div className="max-h-[26rem] space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-[1.25rem] px-4 py-3 text-sm leading-7 ${
                  message.role === "assistant"
                    ? "border border-[#2a2510] bg-[#1f1a00] text-[#fefce8]"
                    : "ml-auto bg-[#d4af37] text-[#0c0c0c]"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isSending ? (
              <div className="max-w-[90%] rounded-[1.25rem] border border-[#2a2510] bg-[#1f1a00] px-4 py-3 text-sm text-[#fefce8]">
                Thinking...
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#1f1f1f] px-5 py-4">
            <div className="flex items-end gap-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask what your numbers mean..."
                rows={2}
                className="min-h-[4rem] flex-1 rounded-[1.2rem] border border-[#1f1f1f] bg-[#0c0c0c] px-4 py-3 text-sm text-[#fefce8] outline-none transition focus:border-[#2a2510]"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={isSending || !draft.trim()}
                className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-[#0c0c0c] transition hover:bg-[#fefce8] disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full border border-[#2a2510] bg-[#1f1a00] px-7 py-4 text-base font-semibold text-[#d4af37] shadow-glow transition hover:bg-[#161616]"
        >
          Ask Coach
        </button>
      )}
    </div>
  );
};
