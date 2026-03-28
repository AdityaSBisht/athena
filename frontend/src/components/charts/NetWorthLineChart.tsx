import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface NetWorthLineChartProps {
  data: Array<{
    year: number;
    projectedNetWorth: number;
  }>;
}

export const NetWorthLineChart = ({ data }: NetWorthLineChartProps) => {
  return (
    <div className="h-80 rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-slate-400">Future Net Worth</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="year" stroke="#a3a3a3" />
          <YAxis stroke="#a3a3a3" tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{
              backgroundColor: "#07111f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px"
            }}
          />
          <Line
            type="monotone"
            dataKey="projectedNetWorth"
            stroke="#d4af37"
            strokeWidth={3}
            dot={{ fill: "#d4af37", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
