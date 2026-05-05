import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { calculateBMI } from "../utils/bmiCalculator";
import { calculateCalories } from "../utils/calorieCalculator";
import { useDispatch, useSelector } from "react-redux";
import { saveUserProfile } from "../app/slices/profileSlice";
import { getUserPlans, suggestPlanWithAI } from "../api/planApi";
import useUserProfile from "../hooks/useUserProfile";
import { addAiExercisesToLibrary } from "../api/services/exerciseService";
import { Activity, Dumbbell, Target, ChevronRight, ChevronLeft, CheckCircle2, Flame, Clock, Footprints, Droplets, Calendar, Scale, Apple, Loader2, Sparkles } from "lucide-react";
import { notifySuccess, notifyError } from "../utils/toast";
import { motion } from "framer-motion";
import { PremiumCard } from "../components/ui/PremiumCard";

const OnboardingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [showWelcome, setShowWelcome] = useState(false);
  const totalSteps = 5;
  const { updateProfile } = useUserProfile();
  const [workoutPlans, setWorkoutPlans] = useState([]);

  useEffect(() => {
    getUserPlans().then(data => setWorkoutPlans(data)).catch(err => console.error(err));
  }, []);

  const user = useSelector(state => state.auth.user);

  const [formData, setFormData] = useState(() => {
    const savedCalibrator = localStorage.getItem("fitforge_landing_calibrator");
    const initialCalibrator = savedCalibrator ? JSON.parse(savedCalibrator) : {};
    
    return {
      name: user?.username || "",
      age: initialCalibrator.age || "",
      height: initialCalibrator.height || "",
      weight: initialCalibrator.weight || "",
      gender: initialCalibrator.gender || "",
      activityLevel: initialCalibrator.activityLevel || "moderate",
      targetWeight: initialCalibrator.weight || "",
      dailyWaterGoal: "8",
      goal: initialCalibrator.goal || "Muscle Gain",
      selectedPlan: null,
      nutritionPreference: "Vegetarian",
      stepTargetType: "5000",
      customStepTarget: "",
      experienceLevel: "Beginner",
      injuries: [],
    };
  });

  useEffect(() => {
    localStorage.removeItem("fitforge_landing_calibrator");
  }, []);

  const [heightUnit, setHeightUnit] = useState("cm"); // "cm" or "ft-in"
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");

  // Convert Imperial height ft-in to Centimeters under the hood
  useEffect(() => {
    if (heightUnit === "ft-in") {
      const ft = Number(heightFt) || 0;
      const inch = Number(heightIn) || 0;
      setTimeout(() => {
        if (ft > 0 || inch > 0) {
          const cm = Math.round((ft * 30.48) + (inch * 2.54));
          setFormData(prev => ({ ...prev, height: cm.toString() }));
        } else {
          setFormData(prev => ({ ...prev, height: "" }));
        }
      }, 0);
    }
  }, [heightFt, heightIn, heightUnit]);

  const handleHeightUnitChange = (unit) => {
    setHeightUnit(unit);
    if (unit === "ft-in" && formData.height) {
      const totalInches = Number(formData.height) / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inch = Math.round(totalInches % 12);
      setHeightFt(ft > 0 ? ft.toString() : "");
      setHeightIn(inch >= 0 ? inch.toString() : "");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelect = (name, value) => setFormData({ ...formData, [name]: value });

  const toggleInjury = (injury) => {
    setFormData(prev => ({
      ...prev,
      injuries: prev.injuries.includes(injury) 
        ? prev.injuries.filter(i => i !== injury)
        : [...prev.injuries, injury]
    }));
  };

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const handleGenerateAIPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await suggestPlanWithAI(formData);
      
      if (plan.exercises && plan.exercises.length > 0) {
        addAiExercisesToLibrary(plan.exercises);
      }
      
      setWorkoutPlans(prev => [plan, ...prev]);
      handleSelect('selectedPlan', plan);
      notifySuccess("AI Custom Plan Generated!");
    } catch (err) {
      notifyError("Failed to generate plan. Check your API key.");
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (!formData.selectedPlan) {
      notifyError("Please select a workout plan before continuing.");
      return;
    }

    const bmiResult = calculateBMI(Number(formData.weight), Number(formData.height));
    const calorieResult = calculateCalories({
      weight: Number(formData.weight), height: Number(formData.height),
      age: Number(formData.age), gender: formData.gender,
      activityLevel: formData.activityLevel, goal: formData.goal,
    });

    localStorage.setItem("fitforge_selected_plan", JSON.stringify(formData.selectedPlan));
    localStorage.removeItem("fitforge_water");
    
    const joinedDate = new Date().toISOString();

    const finalStepTarget = formData.stepTargetType === "Custom" 
      ? Number(formData.customStepTarget) || 10000 
      : Number(formData.stepTargetType.replace(/[^0-9]/g, '')) || 5000;

    const finalProfileData = {
      ...formData, 
      dailyWaterGoal: Number(formData.dailyWaterGoal) || 8,
      stepTarget: finalStepTarget,
      bmi: bmiResult, 
      calories: calorieResult,
      joinedDate 
    };

    dispatch(saveUserProfile(finalProfileData));
    updateProfile(finalProfileData);
    
    setShowWelcome(true);
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const progress = (step / totalSteps) * 100;

  if (showWelcome) {
    const displayWeight = formData.targetWeight || formData.weight;
    return (
      <div className="fixed inset-0 z-50 bg-[var(--bg)] dark:bg-[#030304] flex flex-col items-center justify-center p-6 selection:bg-primary/20 selection:text-primary transition-colors duration-300">
        {/* Ambient Grid Pattern Background */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-fade pointer-events-none opacity-[0.05] dark:opacity-[0.25]" />
        
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[90px] pointer-events-none" />

        <PremiumCard
          animateBorder={true}
          hoverGlow={true}
          className="relative z-10 text-center max-w-xl w-full p-8 md:p-12 bg-card border border-border rounded-3xl"
        >
          {/* Sparkly Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-mono text-[10px] font-bold uppercase tracking-widest mb-6 text-primary dark:text-[#FDBA74]"
          >
            <Sparkles size={12} className="animate-pulse text-primary dark:text-[#FDBA74]" />
            Calibration Successful
          </motion.div>

          {/* Checkmark icon box */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            className="w-16 h-16 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-primary/5"
          >
            <CheckCircle2 size={32} className="text-primary" />
          </motion.div>

          {/* Beautiful Header */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-4xl md:text-5xl font-heading font-black text-[#0F172A] dark:text-white mb-6 tracking-tight leading-[1.15]"
          >
            Welcome, <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {formData.name || "Athlete"}
            </span>.
          </motion.h1>

          {/* Calibrated Message */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-sm md:text-base text-text-secondary font-medium mb-10 leading-relaxed max-w-md mx-auto"
          >
            Your profile is fully calibrated. Let's hit that target weight of{" "}
            <span className="text-text-primary font-bold">{displayWeight ? `${displayWeight}kg` : "your goal"}</span> and crush those{" "}
            <span className="bg-gradient-to-r from-primary to-[#EA580C] bg-clip-text text-transparent font-bold">
              {formData.goal || "Fitness"}
            </span>{" "}
            goals.
          </motion.p>

          {/* Pulsing loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="flex justify-center gap-2.5"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.35, 1, 0.35],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: "easeInOut",
                }}
                className="h-2.5 w-2.5 rounded-full bg-primary"
              />
            ))}
          </motion.div>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col max-w-4xl mx-auto py-4 px-4 relative justify-between">
      
      <div className="mb-4 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevStep} className={`p-2 bg-card border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
             <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Step {step} of {totalSteps}</h2>
          </div>
          <div className="w-10" />
        </div>
        <div className="w-full h-2 bg-card border border-border rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        {step === 1 && (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-3 tracking-tight">Let's get to know you.</h1>
              <p className="text-text-secondary font-medium text-lg">Enter your basic stats so we can calibrate your experience.</p>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">First Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="block w-full px-5 py-4 bg-bg border border-border rounded-xl font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm" />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="block w-full px-5 py-4 bg-bg border border-border rounded-xl font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm" />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full px-5 py-4 bg-bg border border-border rounded-xl font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer shadow-sm">
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-3 tracking-tight">Body Metrics.</h1>
              <p className="text-text-secondary font-medium text-lg">Required to calculate your precise caloric and macro needs.</p>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                {/* HEIGHT BLOCK */}
                <div>
                  <div className="flex justify-between items-center mb-4 px-1 h-[26px]">
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Height</label>
                    <div className="flex bg-bg border border-border rounded-lg p-0.5 shadow-sm text-[10px] font-extrabold uppercase tracking-wider">
                      <button
                        type="button"
                        onClick={() => handleHeightUnitChange("cm")}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer ${heightUnit === "cm" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHeightUnitChange("ft-in")}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer ${heightUnit === "ft-in" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
                      >
                        ft/in
                      </button>
                    </div>
                  </div>

                  {heightUnit === "cm" ? (
                    <div className="relative">
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="170"
                        className="block w-full px-5 py-6 text-center text-3xl font-extrabold bg-bg border border-border rounded-2xl text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm placeholder:text-center placeholder:text-text-secondary/20"
                      />
                      <span className="absolute right-5 bottom-6 text-[10px] font-bold text-text-secondary uppercase tracking-widest pointer-events-none">cm</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="5"
                          value={heightFt}
                          onChange={(e) => setHeightFt(e.target.value)}
                          className="block w-full px-5 py-6 text-center text-3xl font-extrabold bg-bg border border-border rounded-2xl text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm placeholder:text-center placeholder:text-text-secondary/20"
                        />
                        <span className="absolute right-4 bottom-6 text-[10px] font-bold text-text-secondary uppercase tracking-widest pointer-events-none">ft</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="8"
                          value={heightIn}
                          onChange={(e) => setHeightIn(e.target.value)}
                          className="block w-full px-5 py-6 text-center text-3xl font-extrabold bg-bg border border-border rounded-2xl text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm placeholder:text-center placeholder:text-text-secondary/20"
                        />
                        <span className="absolute right-4 bottom-6 text-[10px] font-bold text-text-secondary uppercase tracking-widest pointer-events-none">in</span>
                      </div>
                    </div>
                  )}
                  {heightUnit === "ft-in" && formData.height && (
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider text-center mt-2.5">
                      Converts to <span className="text-primary font-extrabold">{formData.height} cm</span>
                    </p>
                  )}
                </div>

                {/* WEIGHT BLOCK */}
                <div>
                  <div className="flex justify-between items-center mb-4 px-1 h-[26px]">
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Weight</label>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">kg</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="70"
                      className="block w-full px-5 py-6 text-center text-3xl font-extrabold bg-bg border border-border rounded-2xl text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm placeholder:text-center placeholder:text-text-secondary/20"
                    />
                    <span className="absolute right-5 bottom-6 text-[10px] font-bold text-text-secondary uppercase tracking-widest pointer-events-none">kg</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-8">
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4 text-center">Activity Level</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'sedentary', label: 'Sedentary', desc: 'No exercise' },
                    { id: 'light', label: 'Light', desc: '1-3 days/wk' },
                    { id: 'moderate', label: 'Moderate', desc: '3-5 days/wk' },
                    { id: 'active', label: 'Very Active', desc: '6-7 days/wk' },
                  ].map(lvl => (
                    <div key={lvl.id} onClick={() => handleSelect('activityLevel', lvl.id)} className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 text-center ${formData.activityLevel === lvl.id ? 'bg-primary/10 border-primary shadow-sm scale-[1.02]' : 'bg-bg border-border hover:border-primary/30'}`}>
                      <p className={`font-extrabold text-sm ${formData.activityLevel === lvl.id ? 'text-primary' : 'text-text-primary'}`}>{lvl.label}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mt-1">{lvl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4 text-center">Experience Level</label>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                      <div key={lvl} onClick={() => handleSelect('experienceLevel', lvl)} className={`px-4 py-2 rounded-xl cursor-pointer border transition-all duration-300 text-center ${formData.experienceLevel === lvl ? 'bg-primary/10 border-primary shadow-sm' : 'bg-bg border-border hover:border-primary/30'}`}>
                        <span className={`text-xs font-bold uppercase tracking-widest ${formData.experienceLevel === lvl ? 'text-primary' : 'text-text-primary'}`}>{lvl}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4 text-center">Injuries / Limitations</label>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Knee pain', 'Back pain', 'Shoulder issues'].map(injury => (
                      <div key={injury} onClick={() => toggleInjury(injury)} className={`px-4 py-2 rounded-xl cursor-pointer border transition-all duration-300 text-center ${formData.injuries.includes(injury) ? 'bg-danger/10 border-danger shadow-sm' : 'bg-bg border-border hover:border-danger/30'}`}>
                        <span className={`text-xs font-bold uppercase tracking-widest ${formData.injuries.includes(injury) ? 'text-danger' : 'text-text-primary'}`}>{injury}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-3 tracking-tight">Your Targets.</h1>
              <p className="text-text-secondary font-medium text-lg">Define what you want to achieve.</p>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm space-y-6">
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Target Weight (kg)</label>
                  <input type="number" name="targetWeight" value={formData.targetWeight} onChange={handleChange} className="block w-full px-5 py-4 bg-bg border border-border rounded-xl font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Water Goal (Glasses)</label>
                  <input type="number" name="dailyWaterGoal" value={formData.dailyWaterGoal} onChange={handleChange} className="block w-full px-5 py-4 bg-bg border border-border rounded-xl font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Primary Goal</label>
                  <select name="goal" value={formData.goal} onChange={handleChange} className="block w-full px-5 py-4 bg-bg border border-border rounded-xl font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer shadow-sm">
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Fat Loss">Fat Loss</option>
                    <option value="Strength">Strength</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Nutrition</label>
                  <select name="nutritionPreference" value={formData.nutritionPreference} onChange={handleChange} className="block w-full px-5 py-4 bg-bg border border-border rounded-xl font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer shadow-sm">
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="High Protein">High Protein</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Daily Steps</label>
                  <select name="stepTargetType" value={formData.stepTargetType} onChange={handleChange} className="block w-full px-5 py-4 bg-bg border border-border rounded-xl font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer shadow-sm">
                    <option value="5000">5,000</option>
                    <option value="8000">8,000</option>
                    <option value="10000">10,000+</option>
                    <option value="Custom">Custom Goal</option>
                  </select>
                </div>

                {formData.stepTargetType === "Custom" && (
                  <div className="animate-in zoom-in-95 duration-300">
                    <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Custom Target</label>
                    <input type="number" name="customStepTarget" value={formData.customStepTarget} onChange={handleChange} className="block w-full px-5 py-4 bg-bg border border-primary/50 rounded-xl font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-5xl mx-auto w-full space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Target size={32} className="text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2 tracking-tight">Select Your Protocol.</h1>
              <p className="text-text-secondary font-medium text-base">Based on your goals, choose your primary training system.</p>
            </div>
            
            <div className="flex justify-center mb-8">
              <button
                onClick={handleGenerateAIPlan}
                disabled={isGeneratingPlan}
                className="px-8 py-4 btn-primary font-bold text-sm rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-sm disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isGeneratingPlan ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {isGeneratingPlan ? "Forging Custom Plan..." : "Generate AI Custom Plan"}
              </button>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workoutPlans.map(plan => {
                const isSelected = formData.selectedPlan?.id === plan.id;
                const isAI = plan.id === "ai_custom_plan";
                return (
                  <div 
                    key={plan.id} 
                    onClick={() => handleSelect('selectedPlan', plan)}
                    className={`relative p-6 rounded-2xl cursor-pointer border transition-all duration-300 overflow-hidden ${
                      isSelected ? 'bg-primary/5 border-primary shadow-sm scale-[1.02]' : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <h3 className={`text-lg font-extrabold tracking-tight leading-tight ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{plan.title} {isAI && '✨'}</h3>
                      {isSelected && <CheckCircle2 size={20} className="text-primary shrink-0" />}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-border text-text-secondary bg-bg">{plan.level}</span>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-border text-text-secondary bg-bg flex items-center gap-1"><Clock size={10}/>{plan.duration}</span>
                    </div>
                    <p className="text-sm font-medium text-text-secondary relative z-10 leading-snug">{plan.split}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && (() => {
          const bmiResult = calculateBMI(Number(formData.weight), Number(formData.height));
          const calorieResult = calculateCalories({
            weight: Number(formData.weight), height: Number(formData.height),
            age: Number(formData.age), gender: formData.gender,
            activityLevel: formData.activityLevel, goal: formData.goal,
          });
          const weightDiff = Math.abs(Number(formData.weight) - Number(formData.targetWeight));
          const timelineWeeks = weightDiff === 0 ? "Maintenance" : Math.ceil(weightDiff / 0.5) + " Weeks";
          const finalStepTarget = formData.stepTargetType === "Custom" ? (formData.customStepTarget || "10000") : formData.stepTargetType.replace(/[^0-9]/g, '');

          return (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-3 tracking-tight">Final Assessment.</h1>
                <p className="text-text-secondary font-medium text-lg">Review your calculated profile before we forge your dashboard.</p>
              </div>

              <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-bg rounded-2xl p-4 border border-border text-center flex flex-col items-center justify-center shadow-sm">
                    <Scale size={20} className="text-primary mb-2" />
                    <p className="text-xl font-extrabold text-text-primary">{bmiResult?.bmi || "N/A"}</p>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">BMI</p>
                  </div>
                  <div className="bg-bg rounded-2xl p-4 border border-border text-center flex flex-col items-center justify-center shadow-sm">
                    <Flame size={20} className="text-secondary mb-2" />
                    <p className="text-xl font-extrabold text-text-primary">{calorieResult?.targetCalories || "N/A"}</p>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Daily kcal</p>
                  </div>
                  <div className="bg-bg rounded-2xl p-4 border border-border text-center flex flex-col items-center justify-center shadow-sm">
                    <Droplets size={20} className="text-info mb-2" />
                    <p className="text-xl font-extrabold text-text-primary">{formData.dailyWaterGoal}</p>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Glasses/Day</p>
                  </div>
                  <div className="bg-bg rounded-2xl p-4 border border-border text-center flex flex-col items-center justify-center shadow-sm">
                    <Footprints size={20} className="text-success mb-2" />
                    <p className="text-xl font-extrabold text-text-primary">{finalStepTarget}</p>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Steps/Day</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-5 bg-bg rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                      <Target size={18} className="text-secondary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Fitness Goal</span>
                    </div>
                    <span className="text-sm font-extrabold text-text-primary">{formData.goal}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-bg rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-warning" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Est. Timeline</span>
                    </div>
                    <span className="text-sm font-extrabold text-text-primary">{timelineWeeks}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-bg rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                      <Apple size={18} className="text-danger" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Diet Preference</span>
                    </div>
                    <span className="text-sm font-extrabold text-text-primary">{formData.nutritionPreference}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-primary/5 rounded-2xl border border-primary/20 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Dumbbell size={18} className="text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Selected Protocol</span>
                    </div>
                    <span className="text-sm font-extrabold text-primary">{formData.selectedPlan?.title || "None"}</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </div>

      <div className="mt-6 flex justify-center pb-8 relative z-10">
        {step < totalSteps ? (
          <button onClick={nextStep} disabled={step === 4 && !formData.selectedPlan} className="px-10 py-4 btn-primary text-sm font-bold rounded-xl hover:scale-105 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            onClick={handleSubmit} 
            className="px-10 py-4 btn-primary text-sm font-bold rounded-xl hover:scale-105 transition-all shadow-sm flex items-center gap-2"
          >
            Generate Profile <Activity size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;