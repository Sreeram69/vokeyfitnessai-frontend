import { useMemo } from "react";
import useUserProfile from "../../hooks/useUserProfile";

const YearStreakCalendar = ({ sessions = [] }) => {
  const { profile } = useUserProfile();
  
  const activityMap = useMemo(() => {
    const map = {};
    sessions.forEach(session => {
      const dateKey = new Date(session.date).toLocaleDateString();
      const exerciseCount = Array.isArray(session.exercisesCompleted) ? session.exercisesCompleted.length : (session.exercisesCompleted || 1);
      map[dateKey] = (map[dateKey] || 0) + exerciseCount;
    });
    return map;
  }, [sessions]);

  // Generate blocks grouped by month
  const { monthBlocks } = useMemo(() => {
    const today = new Date();
    
    let startDate = profile?.joinedDate ? new Date(profile.joinedDate) : new Date(today);
    
    if (isNaN(startDate.getTime())) {
       startDate = new Date(today);
    }
    
    // Start from the first day of the joined month to ensure a clean block
    startDate.setDate(1);

    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);

    const diffTime = endDate.getTime() - startDate.getTime();
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const blocks = [];
    let currentMonthName = null;
    let currentBlock = null;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateKey = d.toLocaleDateString();
      const count = activityMap[dateKey] || 0;
      
      let intensity = 0;
      if (count > 0 && count <= 2) intensity = 1;
      else if (count > 2 && count <= 5) intensity = 2;
      else if (count > 5 && count <= 8) intensity = 3;
      else if (count > 8) intensity = 4;

      const monthName = d.toLocaleString('default', { month: 'short' });
      
      if (monthName !== currentMonthName) {
        if (currentBlock) blocks.push(currentBlock);
        currentMonthName = monthName;
        
        const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...
        const padding = Array(dayOfWeek).fill(null); // Align the first day to the correct row
        
        currentBlock = {
          name: monthName,
          days: [...padding, { date: dateKey, count, intensity }]
        };
      } else {
        currentBlock.days.push({ date: dateKey, count, intensity });
      }
    }
    if (currentBlock) blocks.push(currentBlock);
    
    return { monthBlocks: blocks };
  }, [activityMap, profile]);

  const getIntensityColor = (level) => {
    switch(level) {
      case 1: return "bg-primary/25 border border-primary/20";
      case 2: return "bg-primary/50 border border-primary/40";
      case 3: return "bg-primary/75 border border-primary/60 shadow-sm";
      case 4: return "bg-primary border border-primary shadow-sm shadow-primary/20";
      default: return "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10";
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
           <h3 className="text-xl font-extrabold text-text-primary tracking-tight">Yearly Consistency</h3>
           <p className="text-sm font-medium text-text-secondary mt-1">Every rep builds the streak.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary bg-bg px-3 py-1.5 rounded-xl border border-border">
           <span>Less</span>
           <div className="flex gap-1 mx-1">
             {[0, 1, 2, 3, 4].map(level => (
               <div key={level} className={`w-3 h-3 rounded-[3px] ${getIntensityColor(level)}`} />
             ))}
           </div>
           <span>More</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar pb-6 pt-2">
        <div className="min-w-max flex gap-4">
          
          {/* Days Sidebar */}
          <div className="flex flex-col justify-end gap-[3px] text-[10px] font-semibold text-text-secondary pb-1 pr-2">
            <span className="h-[14px] leading-[14px]">Sun</span>
            <span className="h-[14px] leading-[14px]"></span>
            <span className="h-[14px] leading-[14px]">Tue</span>
            <span className="h-[14px] leading-[14px]"></span>
            <span className="h-[14px] leading-[14px]">Thu</span>
            <span className="h-[14px] leading-[14px]"></span>
            <span className="h-[14px] leading-[14px]">Sat</span>
          </div>

          {/* Month Blocks */}
          <div className="flex gap-4">
            {monthBlocks.map((block, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-secondary pl-1 tracking-wide">{block.name}</span>
                <div 
                  className="grid gap-[3px]"
                  style={{
                    gridTemplateRows: "repeat(7, 14px)",
                    gridAutoFlow: "column",
                    gridAutoColumns: "14px"
                  }}
                >
                  {block.days.map((day, i) => 
                    day ? (
                      <div 
                        key={i}
                        className={`w-[14px] h-[14px] rounded-[3px] transition-colors duration-300 ${getIntensityColor(day.intensity)}`}
                        title={`${day.count} exercises on ${day.date}`}
                      />
                    ) : (
                      <div key={i} className="w-[14px] h-[14px]" /> // Padding cell
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default YearStreakCalendar;
