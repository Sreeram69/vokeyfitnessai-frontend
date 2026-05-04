import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Activity,
  Brain,
  Menu,
  ChevronRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Scale,
  Flame,
  User2
} from "lucide-react";
import { useState } from "react";
import { PremiumCard } from "../components/ui/PremiumCard";
import { AnimatedButton } from "../components/ui/AnimatedButton";
import { staggerContainer, staggerItem } from "../animations/stagger";
import previewImg from "../assets/dashboard_preview.png";

export const LandingPageV2 = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: Brain,
      title: "Adaptive Intelligence",
      description: "Our neural algorithms learn from every set, adjustment, and fatigue level, optimizing future programs automatically."
    },
    {
      icon: BarChart3,
      title: "Clarity Analytics",
      description: "Understand progress with elegant, detailed, high-contrast charts. Zero noise, absolute focus on stats."
    },
    {
      icon: Dumbbell,
      title: "Focus Training Protocol",
      description: "Immersive training screens keep you locked in. Live sets, progress indicators, and instant calculations."
    }
  ];

  const pricingPlans = [
    {
      name: "Lite Regime",
      price: isAnnual ? "699" : "899",
      description: "For tracking individual progress with baseline metrics.",
      features: [
        "Interactive Exercise Library",
        "Core Progress Graph",
        "Custom Plan Creator",
        "Manual Nutrition Logging"
      ],
      isPopular: false
    },
    {
      name: "AI Elite Athlete",
      price: isAnnual ? "1299" : "1699",
      description: "Our premium tier leveraging real-time neural coaching feedback.",
      features: [
        "Interactive Exercise Library",
        "Predictive AI Plan Generation",
        "Advanced Analytics & Charts",
        "Smart Meal Scan Recommendations",
        "Priority Support Integration"
      ],
      isPopular: true
    }
  ];

  const faqs = [
    {
      question: "How does the AI adaptive engine generate splits?",
      answer: "The AI engine analyzes your baseline inputs (experience, focus target, injuries) and continuously updates muscle volume loads based on completed workouts, sets, and logged active fatigue."
    },
    {
      question: "Can I cancel or switch my premium tier at any time?",
      answer: "Absolutely. All subscriptions are self-managed inside your profile settings. Downgrades or cancellations take effect at the end of the billing period."
    },
    {
      question: "Does it support local offline data persistence?",
      answer: "Yes. Key active workout sessions and dashboard metrics cache directly to local storage to prevent data loss during network disruptions, syncing with our cloud database once restored."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] dark:bg-[#030304] text-[#0F172A] dark:text-white selection:bg-primary/20 selection:text-primary transition-colors duration-300">
      {/* Background Subtle Grid Pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid-fade pointer-events-none opacity-[0.05] dark:opacity-[0.25]" />
      
      {/* Floating Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-[#030304]/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-colors">
        <div className="mx-auto max-w-6xl px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
               <Activity size={18} strokeWidth={2.5} className="text-white animate-heartbeat" />
             </div>
             <span className="font-heading text-base font-extrabold tracking-tight">Vokey Fitness AI</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors">Log In</Link>
            <Link to="/register">
              <AnimatedButton variant="primary" size="sm">
                Get Started
              </AnimatedButton>
            </Link>
          </div>

          <button className="md:hidden p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={20} />
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#0F1115] border-b border-black/5 dark:border-white/10 p-4 flex flex-col gap-2 shadow-xl"
          >
            <Link to="/login" className="w-full text-center py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">Log In</Link>
            <Link to="/register" className="w-full text-center py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-primary to-secondary rounded-full shadow-md">Get Started</Link>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        {/* Glow ambient backgrounds */}
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" 
        />
        <motion.div 
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" 
        />
        
        {/* Interactive Ambient Decorative Particles */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-24 left-[12%] w-24 h-24 rounded-full border border-primary/10 pointer-events-none opacity-30 hidden md:block"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [360, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-48 right-[12%] w-32 h-32 rounded-full border border-secondary/10 pointer-events-none opacity-30 hidden md:block"
        />

        <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
          {/* Copy HUD & Branding (Centered) */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full flex flex-col items-center text-center"
          >
            <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-mono text-[10px] font-bold uppercase tracking-widest mb-6 text-primary dark:text-[#FDBA74]">
               <Sparkles size={12} /> The next generation of fitness
            </motion.div>

            <motion.h1 
              variants={staggerItem}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight leading-[1.1] mb-6 text-[#0F172A] dark:text-white text-center"
            >
              Intelligence applied to <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">human performance.</span>
            </motion.h1>

            <motion.p 
              variants={staggerItem}
              className="text-base sm:text-lg text-[#64748B] dark:text-[#94A3B8] max-w-2xl font-medium mb-8 leading-relaxed text-center mx-auto"
            >
              Beautifully designed tracking, adaptive AI coaching, and deep analytics. Experience the most elegant way to reach your peak potential.
            </motion.p>

            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto mb-12">
              <Link to="/register" className="w-full sm:w-auto">
                <AnimatedButton variant="primary" size="lg" className="w-full sm:w-auto">
                   Start Free Trial {/*<ChevronRight size={16} className="ml-1" /> */}
                </AnimatedButton>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <AnimatedButton variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Features
                </AnimatedButton>
              </a>
            </motion.div>
            
            {/* Real-time Platform Metrics Ticker (Centered) */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-wrap items-center justify-center gap-12 pt-8 border-t border-black/5 dark:border-white/5 w-full text-center"
            >
              <div>
                <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">48k+</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mt-1">Active Workouts</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">99.4%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mt-1">AI plan success</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">4.9/5</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mt-1">Rating</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Detail Grid */}
      <section id="features" className="py-24 px-6 bg-black/5 dark:bg-black/20 border-t border-black/5 dark:border-white/5 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight mb-4">Designed for clarity. Engineered for results.</h2>
            <p className="text-sm md:text-base text-[#64748B] dark:text-[#94A3B8] font-medium">Every component is engineered to remove resistance between you and your fitness milestones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <PremiumCard key={idx} className="p-8 cursor-pointer flex flex-col bg-white/60 dark:bg-[#0B0F19]/40 border-black/5 dark:border-white/5">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 border border-primary/25 shadow-sm">
                  <feat.icon size={20} strokeWidth={2} />
                </div>
                <h3 className="font-heading text-lg font-extrabold mb-3 tracking-tight">{feat.title}</h3>
                <p className="text-[#64748B] dark:text-[#94A3B8] text-xs leading-relaxed font-medium">{feat.description}</p>
              </PremiumCard>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Pricing Grid Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight mb-4">Pricing plans for any stage.</h2>
            <p className="text-sm md:text-base text-[#64748B] dark:text-[#94A3B8] font-medium">Simple, scalable tiers with zero hidden fees. Cancel or upgrade anytime.</p>
            
            {/* Toggle switch */}
            <div className="relative inline-flex items-center gap-1 mt-8 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-1 rounded-2xl">
              <div className="absolute inset-y-1 left-1 bg-white dark:bg-[#0F121D] rounded-xl shadow-sm transition-all duration-300" style={{
                left: isAnnual ? 'calc(50% - 2px)' : '4px',
                width: 'calc(50% - 2px)'
              }} />
              <button 
                onClick={() => setIsAnnual(false)} 
                className={`relative z-10 px-5 py-1.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-colors duration-300 ${!isAnnual ? "text-primary dark:text-[#FDBA74]" : "text-[#64748B]"}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)} 
                className={`relative z-10 px-5 py-1.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-colors duration-300 ${isAnnual ? "text-primary dark:text-[#FDBA74]" : "text-[#64748B]"}`}
              >
                Annually
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <PremiumCard 
                key={idx} 
                animateBorder={plan.isPopular}
                className={`p-8 flex flex-col justify-between border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#0B0F19]/40 ${plan.isPopular ? "border-primary/40 ring-1 ring-primary/20" : ""}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-heading text-lg font-black tracking-tight">{plan.name}</h3>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">{plan.description}</p>
                    </div>
                    {plan.isPopular && (
                      <span className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary dark:text-[#FDBA74] uppercase tracking-wide">Popular</span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 my-6">
                    <span className="text-4xl font-extrabold font-heading">₹{plan.price}</span>
                    <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">/ month</span>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-black/5 dark:border-white/5 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold">
                        <CheckCircle2 size={14} className="text-primary shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/register" className="w-full">
                  <AnimatedButton variant={plan.isPopular ? "primary" : "secondary"} className="w-full">
                    Activate {plan.name}
                  </AnimatedButton>
                </Link>
              </PremiumCard>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions FAQ */}
      <section className="py-24 px-6 bg-black/5 dark:bg-black/20 border-t border-black/5 dark:border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight flex items-center justify-center gap-2.5">
              <HelpCircle size={28} className="text-primary" /> Questions & answers
            </h2>
            <p className="text-xs md:text-sm text-[#64748B] dark:text-[#94A3B8] font-medium mt-2">Everything you need to know about the AI Workout platform.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <PremiumCard key={idx} className="p-0 overflow-hidden bg-white/70 dark:bg-[#0B0F19]/40 border-black/5 dark:border-white/5">
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                  >
                    <span className="text-sm font-bold text-[#0F172A] dark:text-white pr-4">{faq.question}</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={16} className="text-[#64748B] dark:text-[#94A3B8]" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8] font-medium border-t border-black/5 dark:border-white/5 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </PremiumCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#030304] py-12 px-6 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
               <Activity size={16} strokeWidth={2.5} className="text-white animate-heartbeat" />
             </div>
             <span className="font-heading font-extrabold text-[#0F172A] dark:text-white tracking-tight">Vokey Fitness AI</span>
           </div>
           <div className="flex flex-col md:flex-row items-center gap-6">
             <Link to="/privacy-policy" className="font-mono text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] hover:text-primary transition-colors underline decoration-dotted decoration-primary/45 underline-offset-4">
               Privacy Policy
             </Link>
             <p className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold">© 2026 Vokey Fitness AI. All rights reserved.</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageV2;
