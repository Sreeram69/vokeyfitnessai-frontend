import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Hourglass } from "lucide-react";

const CountdownWidget = () => {
  const defaultTime = 60; // 1 minute default
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const endTimeRef = useRef(0);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      interval = setInterval(() => {
        const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          setIsRunning(false);
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      }, 100);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(defaultTime);
  };

  const adjustTime = (amount) => {
    if (!isRunning) {
      setTimeLeft(prev => Math.max(0, prev + amount));
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const pad = (num) => num.toString().padStart(2, "0");

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-orange-500/10 transition-colors duration-700" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/20 text-orange-400">
            <Hourglass size={16} />
          </span>
          <span className="text-sm font-bold text-gray-300 uppercase tracking-wide">Rest Timer</span>
        </div>
        {!isRunning && (
          <div className="flex gap-2">
            <button onClick={() => adjustTime(-30)} className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 font-bold text-xs transition">-30s</button>
            <button onClick={() => adjustTime(30)} className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 font-bold text-xs transition">+30s</button>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center gap-2 lg:gap-4 my-8 relative z-10">
        {/* Minutes */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl w-24 h-32 flex items-center justify-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-1/2" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-black/30" />
          <span className="text-6xl lg:text-7xl font-black text-white font-mono z-10">{pad(minutes)}</span>
        </div>
        <span className="text-4xl lg:text-6xl font-black text-gray-600 animate-pulse">:</span>
        {/* Seconds */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl w-24 h-32 flex items-center justify-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-1/2" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-black/30" />
          <span className={`text-6xl lg:text-7xl font-black font-mono z-10 ${timeLeft === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{pad(seconds)}</span>
        </div>
      </div>

      <div className="flex gap-4 relative z-10 mt-auto">
        <button 
          onClick={toggleTimer}
          disabled={timeLeft === 0}
          className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
            timeLeft === 0 ? "bg-gray-800 text-gray-600 cursor-not-allowed" :
            isRunning 
              ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20" 
              : "bg-orange-500 text-black shadow-orange-500/20 hover:bg-orange-400 hover:scale-[1.02] active:scale-95"
          }`}
        >
          {isRunning ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start</>}
        </button>
        <button 
          onClick={resetTimer}
          className="px-6 py-4 rounded-2xl bg-gray-800 border border-gray-700 text-white font-bold hover:bg-gray-700 transition"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default CountdownWidget;
