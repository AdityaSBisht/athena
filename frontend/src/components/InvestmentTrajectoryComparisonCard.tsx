import { useEffect, useState } from "react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { fetchInvestShiftMeta, projectInvestShift } from "../lib/api";
import type {
  AnalysisResponse,
  InvestShiftMetaResponse,
  InvestShiftProjectionResponse,
  UserPayload
} from "../types/finance";
import { useDemoScenario } from "../hooks/useDemoScenario";

interface InvestmentTrajectoryComparisonCardProps {
  selectedUser: UserPayload | null;
  analysis: AnalysisResponse | null;
}

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString()}`;

const QuoteSkeleton = () => (
  <div className="mt-2 space-y-3">
    <div className="h-7 w-28 animate-pulse rounded-full bg-gradient-to-r from-[#1a1a1a] via-[#2a2510] to-[#1a1a1a]" />
    <div className="h-4 w-20 animate-pulse rounded-full bg-gradient-to-r from-[#1a1a1a] via-[#2a2510] to-[#1a1a1a]" />
  </div>
);

export const InvestmentTrajectoryComparisonCard = ({
  selectedUser,
  analysis
}: InvestmentTrajectoryComparisonCardProps) => {
  const { setInvestShiftSettings } = useDemoScenario();
  const [meta, setMeta] = useState<InvestShiftMetaResponse | null>(null);
  const [projection, setProjection] = useState<InvestShiftProjectionResponse | null>(null);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [investPercentage, setInvestPercentage] = useState(35);
  const [horizonYears, setHorizonYears] = useState(20);
  const [selectedIndexId, setSelectedIndexId] = useState("sp500");

  useEffect(() => {
    setCurrentSavings(Math.round(selectedUser?.profile.startingNetWorth ?? 0));
    setMonthlyContribution(Math.round(analysis?.metrics.monthlySavingsActual ?? 0));
  }, [selectedUser, analysis]);

  useEffect(() => {
    const loadMeta = async () => {
      const response = await fetchInvestShiftMeta();
      setMeta(response);
      setSelectedIndexId(response.defaultIndexId);
    };

    void loadMeta();
  }, []);

  useEffect(() => {
    if (!meta) {
      return;
    }

    const loadProjection = async () => {
      const response = await projectInvestShift({
        selectedIndexId,
        currentSavings,
        monthlyContribution,
        investPercentage,
        horizonYears
      });
      setProjection(response);
    };

    void loadProjection();
  }, [meta, selectedIndexId, currentSavings, monthlyContribution, investPercentage, horizonYears]);

  const selectedIndex =
    projection?.selectedIndex ?? meta?.indexes.find((index) => index.id === selectedIndexId) ?? null;
  const chartData = projection?.chartData ?? [];
  const lastPoint = chartData[chartData.length - 1];
  const difference = projection?.difference ?? 0;
  const takeaway = projection?.takeaway ?? "";
  const selectedIndexRiskNote = projection?.selectedIndexRiskNote ?? "";
  const displayedIndexes = meta?.indexes ?? [];
  const displayedStocks = meta?.topStocks ?? [];

  useEffect(() => {
    if (!selectedIndex || !lastPoint) {
      return;
    }

    setInvestShiftSettings({
      selectedIndexId,
      selectedIndexName: selectedIndex.name,
      selectedIndexReturn: selectedIndex.annualReturn,
      currentSavings,
      monthlyContribution,
      investPercentage,
      horizonYears,
      savingsEndValue: lastPoint.savings,
      investmentEndValue: lastPoint.investment
    });
  }, [
    selectedIndex,
    selectedIndexId,
    currentSavings,
    monthlyContribution,
    investPercentage,
    horizonYears,
    lastPoint,
    setInvestShiftSettings
  ]);

  if (!meta || !selectedIndex || !lastPoint || !projection) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Invest Shift</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Savings vs investing over time</h2>
          </div>
          <div className="rounded-full border border-[#2a2510] bg-[#1f1a00] px-4 py-2 text-sm text-[#d4af37]">
            Loading market data
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Indexes</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`index-skeleton-${index}`} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="h-4 w-24 animate-pulse rounded-full bg-gradient-to-r from-[#1a1a1a] via-[#2a2510] to-[#1a1a1a]" />
                <QuoteSkeleton />
                <div className="mt-4 h-3 w-36 animate-pulse rounded-full bg-gradient-to-r from-[#1a1a1a] via-[#2a2510] to-[#1a1a1a]" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Top Performing Stocks</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`stock-skeleton-${index}`} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="h-4 w-16 animate-pulse rounded-full bg-gradient-to-r from-[#1a1a1a] via-[#2a2510] to-[#1a1a1a]" />
                <QuoteSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Invest Shift
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Savings vs investing over time
          </h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            The frontend only sends the inputs now. The backend owns the market assumptions,
            compounding logic, and projected trajectory that powers this comparison.
          </p>
        </div>

        <div className="rounded-full border border-signal-good/25 bg-signal-good/10 px-4 py-2 text-sm text-signal-accent">
          Horizon: {horizonYears} years
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Indexes</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          {displayedIndexes.map((index) => {
            const positive = !index.change.startsWith("-");
            const selected = index.id === selectedIndex.id;

            return (
              <button
                key={index.id}
                type="button"
                onClick={() => setSelectedIndexId(index.id)}
                className={`rounded-3xl border p-5 text-left transition ${
                  selected
                    ? "border-signal-good bg-signal-good/10 shadow-glow"
                    : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <p className="text-sm text-slate-400">{index.name}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{index.value}</p>
                <p
                  className="mt-2 text-sm font-medium"
                  style={{ color: positive ? "#4ade80" : "#f87171" }}
                >
                  {index.change}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.28em] text-slate-500">
                  Historical annual return: {index.annualReturn}%
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {index.annualReturn >= 12
                    ? "High growth profile"
                    : index.annualReturn >= 9
                      ? "Core market profile"
                      : "Conservative profile"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Top Performing Stocks</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          {displayedStocks.map((stock) => {
            const positive = !stock.change.startsWith("-");

            return (
            <div key={stock.ticker} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-slate-400">{stock.ticker}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stock.price}</p>
              <p
                className="mt-2 text-sm font-medium"
                style={{ color: positive ? "#4ade80" : "#f87171" }}
              >
                {stock.change}
              </p>
            </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        <label className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-slate-400">Current savings amount</p>
          <input
            type="number"
            min="0"
            step="100"
            value={currentSavings}
            onChange={(event) => setCurrentSavings(Number(event.target.value) || 0)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-signal-good/50"
          />
        </label>

        <label className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-slate-400">Monthly savings contribution</p>
          <input
            type="number"
            min="0"
            step="25"
            value={monthlyContribution}
            onChange={(event) => setMonthlyContribution(Number(event.target.value) || 0)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-signal-good/50"
          />
        </label>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Divert to investing</p>
              <p className="mt-1 text-2xl font-semibold text-white">{investPercentage}%</p>
            </div>
            <div className="text-right text-sm text-slate-400">
              <p>Savings: {formatCurrency(monthlyContribution * (1 - investPercentage / 100))}/mo</p>
              <p>Investing: {formatCurrency(monthlyContribution * (investPercentage / 100))}/mo</p>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={investPercentage}
            onChange={(event) => setInvestPercentage(Number(event.target.value))}
            className="mt-4 w-full accent-[#d4af37]"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {[10, 20, 30].map((years) => (
          <button
            key={years}
            type="button"
            onClick={() => setHorizonYears(years)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              horizonYears === years
                ? "bg-signal-good text-ink-950"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {years} years
          </button>
        ))}
      </div>

      <div className="mt-6 inline-flex rounded-full border border-signal-good/25 bg-signal-good/10 px-4 py-2 text-sm text-signal-accent">
        Projected using {selectedIndex.name} avg. return ({selectedIndex.annualReturn}%)
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white">
          Savings line: {projection.savingsAnnualRate}% APY
        </div>
        <div className="rounded-full border border-signal-good/20 bg-signal-good/10 px-4 py-2 text-sm text-signal-accent">
          Investment line: {selectedIndex.annualReturn}% avg. annual return
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300">
          {selectedIndexRiskNote}
        </div>
      </div>

      <div className={`mt-6 rounded-3xl border p-5 ${difference > 0 ? "border-signal-good/25 bg-signal-good/10" : "border-white/10 bg-black/20"}`}>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Winner</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`text-3xl font-semibold ${difference > 0 ? "text-signal-accent" : "text-white"}`}>
              {difference > 0 ? `Investing leads by ${formatCurrency(difference)}` : "Savings still leads"}
            </p>
            <p className="mt-2 max-w-3xl text-slate-300">{takeaway}</p>
          </div>
          <button
            type="button"
            onClick={() => setInvestPercentage(Math.min(100, investPercentage + 15))}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-signal-accent"
          >
            Try More Investing
          </button>
        </div>
      </div>

      <div className="mt-8 h-[26rem] rounded-3xl border border-white/10 bg-black/20 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 24, right: 36, left: 12, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#a3a3a3"
              tickFormatter={(value) => `${value}y`}
            />
            <YAxis
              stroke="#a3a3a3"
              tickFormatter={(value) => `$${Math.round(value).toLocaleString()}`}
              width={92}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "#020403",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px"
              }}
            />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#fefce8"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#ffffff" }}
            >
              <LabelList
                dataKey="savingsLabel"
                position="top"
                fill="#fefce8"
                fontSize={12}
              />
            </Line>
            <Line
              type="monotone"
              dataKey="investment"
              stroke="#d4af37"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#d4af37" }}
            >
              <LabelList
                dataKey="investmentLabel"
                position="top"
                fill="#d4af37"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-slate-400">Savings end value</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatCurrency(lastPoint.savings)}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-slate-400">Investment end value</p>
          <p className="mt-2 text-3xl font-semibold text-signal-good">
            {formatCurrency(lastPoint.investment)}
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-500">Data is for display purposes only.</p>
    </section>
  );
};
