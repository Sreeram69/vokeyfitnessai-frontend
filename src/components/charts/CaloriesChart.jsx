import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", calories: 450 },
  { day: "Tue", calories: 520 },
  { day: "Wed", calories: 610 },
  { day: "Thu", calories: 480 },
  { day: "Fri", calories: 700 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-4 shadow-2xl shadow-orange-500/20">
        <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider mb-1">{payload[0].payload.day}</p>
        <p className="text-white font-extrabold text-2xl">{payload[0].value} <span className="text-sm font-semibold text-[#94A3B8]">kcal</span></p>
      </div>
    );
  }
  return null;
};

const CaloriesChart = () => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="day" stroke="#94A3B8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(247, 147, 26, 0.05)' }} />
        <Bar dataKey="calories" fill="#F7931A" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CaloriesChart;