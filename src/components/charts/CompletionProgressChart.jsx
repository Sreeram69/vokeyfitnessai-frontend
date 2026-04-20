import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useSelector } from 'react-redux';
import useUserProfile from '../../hooks/useUserProfile';
import { useTheme } from '../../context/ThemeContext';

const formatTime = (ms) => {
  if (!ms) return "0s";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xl min-w-[180px]">
        <p className="text-text-secondary text-xs font-bold uppercase tracking-wider border-b border-border pb-2 mb-3">{label}</p>
        <p className="text-text-primary font-extrabold text-2xl mb-3">{data.completion}% <span className="text-sm font-semibold text-text-secondary">Done</span></p>
        <div className="space-y-2">
          <p className="text-primary text-xs font-bold flex justify-between"><span>Time:</span> <span>{formatTime(data.timeTaken)}</span></p>
          <p className="text-secondary text-xs font-bold flex justify-between"><span>Calories:</span> <span>{data.caloriesBurned} kcal</span></p>
          <p className="text-secondary text-xs font-bold flex justify-between"><span>Water:</span> <span>{data.waterIntake} gls</span></p>
          <p className="text-success text-xs font-bold flex justify-between"><span>Steps:</span> <span>{data.steps}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

const CompletionProgressChart = ({ waterIntake = 0, steps = 0 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const { profile } = useUserProfile();
  const sessions = useSelector((state) => state.progress.activities || []);
  const chartData = useMemo(() => {
    
    const joinedDate = profile?.joinedDate ? new Date(profile.joinedDate) : new Date();
    joinedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today - joinedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const daysToShow = Math.min(Math.max(diffDays + 1, 7), 30); // Show at least 7 days, max 30
    const data = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString();
      
      const session = sessions.find(s => new Date(s.date).toLocaleDateString() === dateString && !s.isCustom);
      
      const isToday = dateString === today.toLocaleDateString();
      const liveWater = isToday ? waterIntake : session?.waterIntake || 0;
      const liveSteps = isToday ? steps : session?.steps || 0;
      
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completion: session?.completionPercentage || 0,
        timeTaken: session?.timeTaken || 0,
        caloriesBurned: session?.caloriesBurned || 0,
        waterIntake: liveWater,
        steps: liveSteps
      });
    }
    
    return data;
  }, [profile, sessions, waterIntake, steps]);

  // Color mappings
  const fill100 = '#F7931A'; // Bitcoin Orange
  const fillPartial = '#FFD600'; // Digital Gold
  const fillEmpty = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)';
  const cursorColor = isDark ? 'rgba(247, 147, 26, 0.1)' : 'rgba(247, 147, 26, 0.05)';

  return (
    <div className="w-full h-full bg-transparent">
      <h3 className="text-xl font-extrabold text-text-primary mb-6 tracking-tight">Daily Completion Rate</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorColor }} />
            <Bar dataKey="completion" radius={[6, 6, 6, 6]} barSize={28}>
              {chartData.map((entry, index) => (
                <Cell 
                   key={`cell-${index}`} 
                   fill={entry.completion === 100 ? fill100 : entry.completion > 0 ? fillPartial : fillEmpty} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CompletionProgressChart;
