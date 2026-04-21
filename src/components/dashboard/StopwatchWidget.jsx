import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";

const StopwatchWidget = ({ onTimeUpdate, isRunningControl, setIsRunningControl, resetTrigger }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [internalIsRunning, setInternalIsRunning] = useState(false);

  useEffect(() => {
    if (resetTrigger) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTimeElapsed(0);
      if (setIsRunningControl) setIsRunningControl(false);
      else setInternalIsRunning(false);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [resetTrigger, setIsRunningControl]);

  useEffect(() => {
    if (onTimeUpdate) onTimeUpdate(timeElapsed);
  }, [timeElapsed, onTimeUpdate]);
  
  
  const isRunning = isRunningControl !== undefined ? isRunningControl : internalIsRunning;
  const setIsRunning = setIsRunningControl || setInternalIsRunning;
  const startTimeRef = useRef(0);
  const requestRef = useRef(null);

  const updateTime = () => {
    // eslint-disable-next-line react-hooks/purity
    setTimeElapsed(Date.now() - startTimeRef.current);
    requestRef.current = requestAnimationFrame(updateTime);
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - timeElapsed;
      requestRef.current = requestAnimationFrame(updateTime);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeElapsed(0);
  };

  const minutes = Math.floor((timeElapsed / 60000) % 60);
  const seconds = Math.floor((timeElapsed / 1000) % 60);
  const milliseconds = Math.floor((timeElapsed / 10) % 100);

  const pad = (num) => num.toString().padStart(2, "0");

  return (
    <div className="bg-gradient-to-br from-[#030304] to-[#0F1115] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-orange-500/10 transition-colors duration-700" />
      
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/20 text-orange-400">
          <Timer size={16} />
        </span>
        <span className="text-sm font-bold text-[#94A3B8] uppercase tracking-wide font-mono">Stopwatch</span>
      </div>

      <div className="flex justify-center items-center gap-2 lg:gap-4 my-8 relative z-10">
        {/* Minutes */}
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl w-20 h-24 lg:w-24 lg:h-32 flex items-center justify-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent h-1/2" />
          <span className="text-5xl lg:text-7xl font-black text-white font-mono">{pad(minutes)}</span>
        </div>
        <span className="text-4xl lg:text-6xl font-black text-white/20 animate-pulse">:</span>
        {/* Seconds */}
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl w-20 h-24 lg:w-24 lg:h-32 flex items-center justify-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent h-1/2" />
          <span className="text-5xl lg:text-7xl font-black text-white font-mono">{pad(seconds)}</span>
        </div>
        <span className="text-2xl lg:text-4xl font-black text-white/20 self-end mb-2 lg:mb-4">.</span>
        {/* Milliseconds */}
        <div className="w-12 h-16 flex items-end justify-center self-end mb-2 lg:mb-4">
          <span className="text-3xl lg:text-4xl font-bold text-orange-400 font-mono">{pad(milliseconds)}</span>
        </div>
      </div>

      <div className="flex gap-4 relative z-10 mt-auto">
        <button 
          onClick={toggleTimer}
          className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
            isRunning 
              ? "bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20" 
              : "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-orange-500/20 hover:from-orange-500 hover:to-orange-400 hover:scale-[1.02] active:scale-95"
          }`}
        >
          {isRunning ? <><Pause size={20} /> Stop</> : <><Play size={20} /> Start</>}
        </button>
        <button 
          onClick={resetTimer}
          className="px-6 py-4 rounded-2xl bg-[#0F1115] border border-white/10 text-white font-bold hover:border-white/20 transition"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default StopwatchWidget;
