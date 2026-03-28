import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const colors = ["#4fd1ff", "#28c76f", "#ff5a6b", "#ffb020", "#8b5cf6", "#34d399", "#f97316"];

interface SpendingPieChartProps {
  data: Record<string, number>;
}

export const SpendingPieChart = ({ data }: SpendingPieChartProps) => {
  const chartData = Object.entries(data)
    .filter(([category]) => category !== "income")
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="h-72 rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-slate-400">Spending Mix</p>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={4}>
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#07111f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
