import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, BrainCircuit, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { chatWithAICoach } from "../../api/aiApi";
import { notifyError } from "../../utils/toast";

const VokeyCoach = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "coach",
      text: "Hey! I am VokeyCoach, your AI fitness & nutrition assistant. How can I help you crush your goals today?"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Voice AI States
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem("fitforge_voice_coach");
    return saved !== "false"; // default true
  });
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  const recognitionRef = useRef(null);

  const suggestions = [
    { text: "Generate Workout", icon: "💪" },
    { text: "Analyze Meal", icon: "🥗" },
    { text: "Fat Loss Tips", icon: "🔥" },
    { text: "Weekly Insights", icon: "📈" }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, loading, isListening]);

  // Cleanup speech synthesis and active listening on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.error("Error cleaning up speech recognition:", err);
        }
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleListening = (e) => {
    e.preventDefault();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notifyError("Speech recognition is not supported in this browser. Please use Google Chrome or MS Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error("Error stopping speech recognition:", err);
        }
      }
      setIsListening(false);
      return;
    }

    // Cancel active TTS output so the coach isn't speaking while user records
    window.speechSynthesis.cancel();
    setActiveSpeakingId(null);

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setMessage((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          notifyError("Microphone permission denied. Please allow microphone access in your browser settings.");
        } else if (event.error !== "no-speech") {
          notifyError(`Voice input error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  // Speech Synthesis Speak Text
  const speakText = (text, index) => {
    if (activeSpeakingId === index) {
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    if (!text) return;

    // Filter markdown formats for a professional reading flow
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // bold
      .replace(/[-*]\s+/g, "")         // bullets
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, "") // code snippets
      .replace(/\n/g, " ")             // lines
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Get premium natural voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => 
      v.name.includes("Google US English") || 
      v.name.includes("Microsoft Zira") ||
      v.name.includes("Samantha") ||
      (v.lang.startsWith("en") && v.name.includes("Natural")) ||
      (v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
    ) || voices.find(v => v.lang.startsWith("en"));

    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }

    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setActiveSpeakingId(index);
    };

    utterance.onend = () => {
      setActiveSpeakingId(null);
    };

    utterance.onerror = () => {
      setActiveSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleGlobalVoice = () => {
    const nextState = !isVoiceEnabled;
    setIsVoiceEnabled(nextState);
    localStorage.setItem("fitforge_voice_coach", String(nextState));
    if (!nextState) {
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    // Cancel ongoing speech when user interacts
    window.speechSynthesis.cancel();
    setActiveSpeakingId(null);

    const userMessage = message.trim();
    setMessage("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await chatWithAICoach(userMessage);
      if (res?.success && res?.data?.reply) {
        const reply = res.data.reply;
        setChatHistory((prev) => {
          const nextHistory = [...prev, { sender: "coach", text: reply }];
          if (isVoiceEnabled) {
            setTimeout(() => {
              speakText(reply, nextHistory.length - 1);
            }, 100);
          }
          return nextHistory;
        });
      } else {
        throw new Error("Failed to get a response from VokeyCoach");
      }
    } catch (err) {
      console.error(err);
      notifyError("VokeyCoach is currently resting. Please try again in a bit!");
      setChatHistory((prev) => [
        ...prev,
        { sender: "coach", text: "Oops, I encountered a brief connection error. Let's try that query again!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestionText) => {
    if (loading) return;

    window.speechSynthesis.cancel();
    setActiveSpeakingId(null);

    setChatHistory((prev) => [...prev, { sender: "user", text: suggestionText }]);
    setLoading(true);

    try {
      const res = await chatWithAICoach(suggestionText);
      if (res?.success && res?.data?.reply) {
        const reply = res.data.reply;
        setChatHistory((prev) => {
          const nextHistory = [...prev, { sender: "coach", text: reply }];
          if (isVoiceEnabled) {
            setTimeout(() => {
              speakText(reply, nextHistory.length - 1);
            }, 100);
          }
          return nextHistory;
        });
      } else {
        throw new Error("Failed to get a response from VokeyCoach");
      }
    } catch (err) {
      console.error(err);
      notifyError("VokeyCoach is currently resting. Please try again in a bit!");
      setChatHistory((prev) => [
        ...prev,
        { sender: "coach", text: "Oops, I encountered a brief connection error. Let's try that query again!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCoachResponse = (text) => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const isListItem = line.trim().startsWith("-") || line.trim().startsWith("*") || /^\d+\./.test(line.trim());
      const cleanLine = line.trim().replace(/^[-*]\s+/, "");
      
      const parts = cleanLine.split(/\*\*(.*?)\*\*/g);
      const renderedLine = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="font-extrabold text-primary dark:text-[#FDBA74]">{part}</strong>;
        }
        return part;
      });

      if (isListItem) {
        return (
          <li key={idx} className="ml-4 list-disc mt-1 text-xs">
            {renderedLine}
          </li>
        );
      }

      return (
        <p key={idx} className="mt-1.5 min-h-[0.5rem] leading-relaxed">
          {renderedLine}
        </p>
      );
    });
  };

  const hasSpeechSupport = typeof window !== "undefined" && (window.webkitSpeechRecognition || window.SpeechRecognition);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors relative cursor-pointer"
          >
            <BrainCircuit size={24} className="animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 260 }}
            className="w-[350px] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl overflow-hidden glass-premium flex flex-col border border-primary/20 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary dark:text-[#FDBA74]">
                  <Sparkles size={18} className="animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-[#0F172A] dark:text-white uppercase tracking-tight">VokeyCoach</h4>
                  <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest block">AI Conversational Coach</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Global Voice Toggle */}
                <button
                  type="button"
                  onClick={toggleGlobalVoice}
                  title={isVoiceEnabled ? "Mute Coach Voice" : "Enable Coach Voice"}
                  className={`p-2 rounded-xl transition-all duration-300 cursor-pointer ${
                    isVoiceEnabled
                      ? "text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {isVoiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setActiveSpeakingId(null);
                    setIsOpen(false);
                  }}
                  className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Message Pane */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar">
              {chatHistory.map((chat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${chat.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm ${
                        chat.sender === "user"
                          ? "bg-primary text-white rounded-br-none animate-fadeIn"
                          : "bg-white/55 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[#475569] dark:text-[#CBD5E1] rounded-bl-none backdrop-blur-md"
                      }`}
                    >
                      {chat.sender === "coach" ? formatCoachResponse(chat.text) : chat.text}
                    </div>

                    <div className="flex flex-col items-center gap-1 mb-1 shrink-0">
                      {activeSpeakingId === index ? (
                        <button
                          type="button"
                          onClick={() => speakText(chat.text, index)}
                          title="Stop Listening"
                          className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center cursor-pointer hover:bg-primary/25 transition-all duration-300"
                        >
                          <div className="flex items-end gap-[1.5px] h-3.5 px-0.5">
                            <span className="w-[1.5px] h-full bg-primary rounded-full animate-voice-wave-1 origin-bottom" />
                            <span className="w-[1.5px] h-full bg-primary rounded-full animate-voice-wave-2 origin-bottom" />
                            <span className="w-[1.5px] h-full bg-primary rounded-full animate-voice-wave-3 origin-bottom" />
                          </div>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => speakText(chat.text, index)}
                          title="Listen to Message"
                          className="w-7 h-7 rounded-xl bg-black/5 dark:bg-white/5 text-[#64748B] dark:text-[#94A3B8] hover:text-primary dark:hover:text-[#FDBA74] flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300"
                        >
                          <Volume2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/55 dark:bg-white/5 border border-black/5 dark:border-white/5 p-3.5 rounded-2xl rounded-bl-none flex items-center gap-1.5 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Suggestions Chips */}
            {chatHistory.length === 1 && !loading && (
              <div className="px-4 pb-3 flex flex-wrap gap-2 animate-fadeIn">
                {suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleSuggestionClick(`${sug.icon} ${sug.text}`)}
                    className="px-3.5 py-1.5 rounded-full bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-primary/40 text-[10px] font-semibold text-text-primary hover:text-primary transition-all duration-300 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>{sug.icon}</span>
                    <span>{sug.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-2 bg-white/30 dark:bg-transparent"
            >
              {/* Voice recognition pulse ribbon */}
              {isListening && (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-red-500/5 dark:bg-red-500/10 rounded-xl border border-red-500/10 self-start animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[9px] font-bold text-red-500 tracking-wider uppercase font-mono">Listening to Voice...</span>
                  <div className="flex items-end gap-[1.5px] h-2.5 px-0.5">
                    <span className="w-[1.5px] h-full bg-red-500 rounded-full animate-voice-wave-1 origin-bottom" />
                    <span className="w-[1.5px] h-full bg-red-500 rounded-full animate-voice-wave-2 origin-bottom" />
                    <span className="w-[1.5px] h-full bg-red-500 rounded-full animate-voice-wave-3 origin-bottom" />
                  </div>
                </div>
              )}

              <div className="flex gap-2 items-center w-full">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isListening ? "Listening... Speak now!" : "Ask VokeyCoach anything..."}
                  readOnly={isListening}
                  className="flex-grow px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary/50 transition-all duration-300 read-only:opacity-90 read-only:cursor-default"
                />

                {/* Voice Input Button */}
                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer ${
                      isListening
                        ? "bg-red-500 text-white shadow-red-500/25 animate-mic-pulse hover:bg-red-600"
                        : "bg-black/5 dark:bg-white/5 text-[#64748B] dark:text-[#94A3B8] hover:text-primary dark:hover:text-[#FDBA74] hover:bg-black/10 dark:hover:bg-white/10"
                    }`}
                    title={isListening ? "Stop Voice Typing" : "Start Voice Typing"}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading || isListening || !message.trim()}
                  className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 hover:bg-primary/95 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VokeyCoach;
