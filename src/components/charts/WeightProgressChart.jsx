import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { week: "Week 1", weight: 78 },
  { week: "Week 2", weight: 77.5 },
  { week: "Week 3", weight: 77 },
  { week: "Week 4", weight: 76.5 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-4 shadow-2xl shadow-orange-500/20">
        <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider mb-1">{payload[0].payload.week}</p>
        <p className="text-white font-extrabold text-2xl">{payload[0].value} <span className="text-sm font-semibold text-[#94A3B8]">kg</span></p>
      </div>
    );
  }
  return null;
};

const WeightProgressChart = () => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="week" stroke="#94A3B8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(247, 147, 26, 0.3)', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#F7931A"
          strokeWidth={3}
          dot={{ fill: '#F7931A', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: '#EA580C', stroke: '#FFD600', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeightProgressChart;