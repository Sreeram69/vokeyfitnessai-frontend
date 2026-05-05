import { useState } from "react";
import { Plus, Droplets, Target, Flame, Activity, CheckCircle2, Search, Loader2, Sparkles, X, Database } from "lucide-react";
import { motion } from "framer-motion";
import useNutritionTracker from "../hooks/useNutritionTracker";
import useUserProfile from "../hooks/useUserProfile";
import { notifySuccess, notifyError } from "../utils/toast";
import { analyzeFoodWithAI, searchFood, getAiSuggestions } from "../api/nutritionApi";
import { addNotification } from "../utils/notifications";
import { SectionTitle } from "../components/ui/SectionTitle";
import { staggerContainer, staggerItem } from "../animations/stagger";

const dietTemplates = {
  "Vegetarian": [
    { meal: "Breakfast", food: "3 Idlis + Sambar", calories: 350, protein: 12, carbs: 55, fats: 6 },
    { meal: "Mid Meal", food: "Banana + Almonds", calories: 220, protein: 6, carbs: 30, fats: 9 },
    { meal: "Lunch", food: "Rice + Dal + Paneer Curry", calories: 650, protein: 32, carbs: 70, fats: 22 },
    { meal: "Evening Snack", food: "Paneer Sandwich", calories: 320, protein: 18, carbs: 35, fats: 10 },
    { meal: "Dinner", food: "Chapati + Soya Chunks + Veggies", calories: 550, protein: 35, carbs: 50, fats: 15 },
  ],
  "Non-Vegetarian": [
    { meal: "Breakfast", food: "4 Whole Eggs + 2 Toast", calories: 400, protein: 28, carbs: 30, fats: 20 },
    { meal: "Mid Meal", food: "Apple + Peanut Butter", calories: 250, protein: 8, carbs: 25, fats: 14 },
    { meal: "Lunch", food: "Rice + Chicken Breast (150g)", calories: 550, protein: 45, carbs: 60, fats: 10 },
    { meal: "Evening Snack", food: "Whey Protein Shake", calories: 120, protein: 25, carbs: 3, fats: 1 },
    { meal: "Dinner", food: "Grilled Fish + Quinoa + Veggies", calories: 500, protein: 40, carbs: 45, fats: 12 },
  ],
  "Vegan": [
    { meal: "Breakfast", food: "Oatmeal with Almond Milk & Seeds", calories: 380, protein: 12, carbs: 50, fats: 14 },
    { meal: "Mid Meal", food: "Roasted Chickpeas", calories: 200, protein: 10, carbs: 30, fats: 5 },
    { meal: "Lunch", food: "Quinoa + Tofu Curry", calories: 580, protein: 30, carbs: 65, fats: 18 },
    { meal: "Evening Snack", food: "Vegan Protein Shake", calories: 130, protein: 24, carbs: 4, fats: 2 },
    { meal: "Dinner", food: "Lentil Soup + Sweet Potato", calories: 450, protein: 22, carbs: 60, fats: 8 },
  ],
  "High Protein": [
    { meal: "Breakfast", food: "5 Egg Whites + 1 Whole Egg + Oats", calories: 350, protein: 35, carbs: 40, fats: 8 },
    { meal: "Mid Meal", food: "Whey Protein Isolate", calories: 110, protein: 25, carbs: 2, fats: 0 },
    { meal: "Lunch", food: "Chicken Breast (200g) + Brown Rice", calories: 600, protein: 60, carbs: 55, fats: 8 },
    { meal: "Evening Snack", food: "Greek Yogurt + Berries", calories: 200, protein: 20, carbs: 15, fats: 5 },
    { meal: "Dinner", food: "Lean Beef/Soya + Broccoli", calories: 450, protein: 45, carbs: 20, fats: 15 },
  ]
};

const MacroCard = ({ label, current, target, color, icon: Icon, unit = "g" }) => {
  const progress = Math.min((current / target) * 100, 100) || 0;
  
  const colorThemes = {
    purple: {
      glow: "bg-primary/10 border-primary/20",
      text: "text-primary dark:text-[#FDBA74]",
    },
    cyan: {
      glow: "bg-secondary/10 border-secondary/20",
      text: "text-[#D97706] dark:text-[#FFD600]",
    },
    orange: {
      glow: "bg-[#EA580C]/10 border-[#EA580C]/20",
      text: "text-[#EA580C] dark:text-[#FB923C]",
    },
    green: {
      glow: "bg-[#10B981]/10 border-[#10B981]/20",
      text: "text-[#10B981] dark:text-[#34D399]",
    },
  };
  
  const theme = colorThemes[color.themeName] || colorThemes.purple;

  return (
    <div className="p-5 flex flex-col justify-between h-[160px] bg-white/50 dark:bg-[#0B0F19]/50 border border-black/8 dark:border-white/5 rounded-2xl relative overflow-hidden backdrop-blur group transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest">
            {label}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <h4 className="text-2xl font-black text-[#0F172A] dark:text-white font-heading tracking-tight">
              {current.toLocaleString()}
            </h4>
            {unit && (
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                {unit}
              </span>
            )}
            {target && (
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                / {target}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-2xl border shrink-0 transition-transform duration-300 group-hover:scale-105 ${theme.glow}`}>
            <Icon className={`w-4 h-4 ${theme.text}`} />
          </div>
        )}
      </div>

      {/* Unified footer holding the progress bar */}
      <div className="mt-2 border-t border-black/5 dark:border-white/5 pt-2 flex flex-col justify-center">
        <div className="flex justify-between text-[8px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-1 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

const NutritionPage = () => {
  const { nutritionData, loading, addMeal } = useNutritionTracker();
  const { profile } = useUserProfile();

  const [activeTab, setActiveTab] = useState("ai"); // 'ai' | 'search'
  const [aiQuery, setAiQuery] = useState("");
  const [dbQuery, setDbQuery] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [searching, setSearching] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [analyzedFood, setAnalyzedFood] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("Breakfast");

  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleAIAnalyze = async () => {
    if (!aiQuery.trim()) return;
    setAnalyzing(true);
    setAnalyzedFood(null);
    try {
      const data = await analyzeFoodWithAI(aiQuery);
      setAnalyzedFood(data);
      
      const hour = new Date().getHours();
      let slot = "Breakfast";
      if (hour >= 11 && hour < 13) slot = "Mid Meal";
      else if (hour >= 13 && hour < 16) slot = "Lunch";
      else if (hour >= 16 && hour < 19) slot = "Evening Snack";
      else if (hour >= 19) slot = "Dinner";
      setSelectedSlot(slot);
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to analyze food. Check your API key.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDbSearch = async () => {
    if (!dbQuery.trim()) return;
    setSearching(true);
    try {
      const res = await searchFood(dbQuery);
      if (res.success && res.data) {
        setSearchResults(res.data);
      }
    } catch (err) {
      console.error("Search error:", err);
      notifyError("Failed to search food database.");
    } finally {
      setSearching(false);
    }
  };

  const loadAiSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await getAiSuggestions();
      if (res.success && res.data) {
        setAiSuggestions(res.data.recommendations);
        notifySuccess("AI recommendations loaded!");
      }
    } catch (e) {
      console.error("AI suggestions error:", e);
      notifyError("Failed to query AI recommendations.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectSearchedFood = (item) => {
    setAnalyzedFood({
      foodName: `${item.name} (${item.servingSize})`,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats
    });
    setSearchResults([]);
  };

  const handleAddAIFood = () => {
    if (!analyzedFood) return;
    const finalMealName = `[${selectedSlot}] ${analyzedFood.foodName}`;
    addMeal({
      name: finalMealName,
      calories: analyzedFood.calories,
      protein: analyzedFood.protein,
      carbs: analyzedFood.carbs,
      fats: analyzedFood.fats
    });
    notifySuccess(`${analyzedFood.foodName} logged successfully under ${selectedSlot}!`);
    addNotification("Meal Logged", `${analyzedFood.foodName} was logged under ${selectedSlot}.`, "nutrition", "low");
    setAnalyzedFood(null);
    setAiQuery("");
    setDbQuery("");
  };

  const pref = profile?.nutritionPreference || "Vegetarian";
  const dailyFoods = dietTemplates[pref] || dietTemplates["Vegetarian"];

  const calorieGoal = dailyFoods.reduce((sum, item) => sum + item.calories, 0);
  const proteinGoal = dailyFoods.reduce((sum, item) => sum + item.protein, 0);
  const carbsGoal = dailyFoods.reduce((sum, item) => sum + item.carbs, 0);
  const fatsGoal = dailyFoods.reduce((sum, item) => sum + item.fats, 0);

  const totalCalories = nutritionData.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const totalProtein = nutritionData.reduce((sum, meal) => sum + Number(meal.protein || 0), 0);
  const totalCarbs = nutritionData.reduce((sum, meal) => sum + Number(meal.carbs || 0), 0);
  const totalFats = nutritionData.reduce((sum, meal) => sum + Number(meal.fats || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={staggerContainer} 
      initial="hidden" 
      animate="visible" 
      className="space-y-6 pb-24 w-full"
    >
      <SectionTitle 
        title="Nutrition Center" 
        subtitle="Track your macros, hit your targets, and fuel your progress."
        action={
          <button
            onClick={loadAiSuggestions}
            disabled={loadingSuggestions}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-mono text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
          >
            {loadingSuggestions ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Get AI Suggestions
          </button>
        }
      />

      {aiSuggestions && (
        <motion.section variants={staggerItem} className="bg-white/40 dark:bg-[#0F1115]/30 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-6 relative animate-in fade-in slide-in-from-top-4">
          <button onClick={() => setAiSuggestions(null)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
          <h4 className="font-heading text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Sparkles className="text-primary" size={18} /> AI Recommended Meal Guide
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(aiSuggestions).map(([slot, text]) => (
              <div key={slot} className="bg-white/80 dark:bg-[#0F1115]/60 p-4 rounded-2xl border border-black/5 dark:border-white/10">
                <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-wider">{slot}</span>
                <p className="text-sm text-text-secondary mt-1">{text}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroCard 
          label="Calories" current={totalCalories} target={calorieGoal} unit="kcal"
          icon={Flame} color={{ themeName: "green" }} 
        />
        <MacroCard 
          label="Protein" current={totalProtein} target={proteinGoal} unit="g"
          icon={Target} color={{ themeName: "purple" }} 
        />
        <MacroCard 
          label="Carbs" current={totalCarbs} target={carbsGoal} unit="g"
          icon={Activity} color={{ themeName: "cyan" }} 
        />
        <MacroCard 
          label="Fats" current={totalFats} target={fatsGoal} unit="g"
          icon={Droplets} color={{ themeName: "orange" }} 
        />
      </motion.section>

      <motion.div variants={staggerItem}>
        <section className="bg-gradient-to-br from-primary/10 to-secondary/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-sm relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 relative z-10 gap-4">
            <div>
              <p className="font-mono text-primary text-xs font-semibold uppercase tracking-widest mb-1">Logger System</p>
              <h3 className="font-heading text-2xl font-bold text-text-primary flex items-center gap-3">
                Smart Food & Nutrition Log
              </h3>
            </div>
            
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl self-start font-mono text-[10px] uppercase font-bold tracking-wider">
              <button 
                onClick={() => { setActiveTab("ai"); setAnalyzedFood(null); }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === "ai" ? "bg-gradient-to-r from-primary to-secondary text-white" : "text-text-secondary hover:text-text-primary"}`}
              >
                AI Describe
              </button>
              <button 
                onClick={() => { setActiveTab("search"); setAnalyzedFood(null); }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === "search" ? "bg-gradient-to-r from-primary to-secondary text-white" : "text-text-secondary hover:text-text-primary"}`}
              >
                Database Search
              </button>
            </div>
          </div>

          <div className="relative z-10">
            {activeTab === "ai" && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={aiQuery} 
                    onChange={(e) => setAiQuery(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleAIAnalyze()}
                    placeholder="What did you eat? e.g., '1 large avocado and 2 scrambled eggs'" 
                    className="w-full pl-6 pr-4 py-4 bg-white dark:bg-[#030304] border-2 border-black/10 dark:border-white/10 rounded-2xl font-mono text-sm focus:border-primary focus:bg-white dark:focus:bg-[#0F1115] transition-all outline-none text-text-primary placeholder:text-text-secondary/40"
                  />
                </div>
                <button 
                  onClick={handleAIAnalyze} 
                  disabled={analyzing || !aiQuery.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold uppercase tracking-widest text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                  {analyzing ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            )}

            {activeTab === "search" && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={dbQuery} 
                      onChange={(e) => setDbQuery(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleDbSearch()}
                      placeholder="Search healthy food items... e.g. 'Chicken' or 'Avocado'" 
                      className="w-full pl-6 pr-4 py-4 bg-white dark:bg-[#030304] border-2 border-black/10 dark:border-white/10 rounded-2xl font-mono text-sm focus:border-primary focus:bg-white dark:focus:bg-[#0F1115] transition-all outline-none text-text-primary placeholder:text-text-secondary/40"
                    />
                  </div>
                  <button 
                    onClick={handleDbSearch} 
                    disabled={searching || !dbQuery.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold uppercase tracking-widest text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 disabled:opacity-50"
                  >
                    {searching ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="bg-white dark:bg-[#030304] border border-black/10 dark:border-white/10 rounded-2xl p-4 max-h-60 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
                    {searchResults.map((item, index) => (
                      <div 
                        key={index} 
                        onClick={() => handleSelectSearchedFood(item)}
                        className="py-3 px-2 flex justify-between items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-lg"
                      >
                        <div>
                          <p className="font-heading text-sm font-bold text-text-primary">{item.name}</p>
                          <p className="font-mono text-[10px] text-text-secondary">Serving Size: {item.servingSize} ({item.category})</p>
                        </div>
                        <div className="flex gap-4 font-mono text-[11px] font-bold">
                          <span className="text-success">{item.calories} kcal</span>
                          <span className="text-primary">P: {item.protein}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {analyzedFood && (
            <div className="mt-6 p-6 bg-white dark:bg-[#0F1115]/60 rounded-2xl border border-black/10 dark:border-white/10 relative z-10 animate-in fade-in slide-in-from-top-4">
              <button onClick={() => setAnalyzedFood(null)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition">
                <X size={20} />
              </button>
              <h4 className="font-heading text-xl font-bold text-text-primary mb-4">{analyzedFood.foodName}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/5 dark:bg-[#030304] p-3 rounded-xl border border-black/5 dark:border-white/10">
                  <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-1">Calories</p>
                  <p className="font-heading text-lg font-bold text-success">{analyzedFood.calories} kcal</p>
                </div>
                <div className="bg-black/5 dark:bg-[#030304] p-3 rounded-xl border border-black/5 dark:border-white/10">
                  <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-1">Protein</p>
                  <p className="font-heading text-lg font-bold text-primary">{analyzedFood.protein}g</p>
                </div>
                <div className="bg-black/5 dark:bg-[#030304] p-3 rounded-xl border border-black/5 dark:border-white/10">
                  <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-1">Carbs</p>
                  <p className="font-heading text-lg font-bold text-[#FFD600]">{analyzedFood.carbs}g</p>
                </div>
                <div className="bg-black/5 dark:bg-[#030304] p-3 rounded-xl border border-black/5 dark:border-white/10">
                  <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-1">Fats</p>
                  <p className="font-heading text-lg font-bold text-danger">{analyzedFood.fats}g</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-mono text-text-secondary uppercase tracking-widest mb-2">Assign Meal Slot</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-4 py-3 bg-black/5 dark:bg-[#030304] border border-black/10 dark:border-white/10 rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Mid Meal">Mid Meal</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening Snack">Evening Snack</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <button 
                onClick={handleAddAIFood}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold uppercase tracking-widest text-sm rounded-xl hover:scale-102 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
              >
                <Plus size={18} /> Add to Daily Log
              </button>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="bg-white/70 dark:bg-[#0F1115]/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div>
                <p className="font-mono text-primary text-xs font-semibold uppercase tracking-widest mb-1">Your Protocol</p>
                <h3 className="font-heading text-2xl font-bold text-text-primary flex items-center gap-3">
                  {pref} Plan
                </h3>
              </div>
              <button 
                onClick={() => {
                  if(window.confirm("Are you sure you want to clear today's meal logs?")) {
                    localStorage.removeItem("fitforge_nutrition");
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-danger/10 text-danger font-mono text-xs font-semibold hover:bg-danger hover:text-white transition-all border border-danger/10"
              >
                Reset Day
              </button>
            </div>

            <div className="relative z-10 flex overflow-x-auto pb-8 pt-4 gap-6 snap-x snap-mandatory hide-scrollbar">
              {dailyFoods.map((food, index) => {
                const loggedMeal = nutritionData.find(m => m.name === food.meal || m.name.startsWith(`[${food.meal}]`));
                const isCompleted = !!loggedMeal;
                const isLast = index === dailyFoods.length - 1;
                const displayName = loggedMeal && loggedMeal.name.startsWith(`[${food.meal}]`)
                  ? loggedMeal.name.replace(`[${food.meal}] `, "")
                  : food.food;
                
                return (
                  <div key={index} className="relative group snap-center min-w-[280px] md:min-w-[320px] shrink-0">
                    {!isLast && (
                      <div className={`absolute top-4 left-[50%] w-[calc(100%+24px)] h-1.5 z-0 transition-colors duration-1000 ${isCompleted && nutritionData.some(m => m.name === dailyFoods[index+1]?.meal || m.name.startsWith(`[${dailyFoods[index+1]?.meal}]`)) ? 'bg-gradient-to-r from-primary to-secondary shadow-sm shadow-primary/20' : 'bg-black/5 dark:bg-white/10'}`} />
                    )}

                    <div className={`relative z-10 w-10 h-10 rounded-full border-[4px] border-white dark:border-[#030304] flex items-center justify-center mb-6 mx-auto transition-colors duration-500 shadow-sm ${isCompleted ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-black/5 dark:bg-[#0F1115]'}`}>
                       {isCompleted && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    
                    <div className={`p-6 rounded-3xl transition-all duration-300 border h-[280px] flex flex-col justify-between ${isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-white dark:bg-[#0F1115]/50 border-black/10 dark:border-white/10 hover:bg-white/90 dark:hover:bg-[#0F1115]'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <p className={`font-mono text-[10px] font-semibold uppercase tracking-widest ${isCompleted ? 'text-primary' : 'text-text-secondary'}`}>{food.meal}</p>
                          <span className="font-mono text-primary text-xs font-semibold bg-primary/10 px-2 py-1 rounded-lg">
                            {food.calories} kcal
                          </span>
                        </div>
                        <h4 className={`font-heading text-xl font-bold mb-4 leading-tight h-14 ${isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{displayName}</h4>
                        
                        <div className="flex flex-wrap gap-2 font-mono text-[10px] font-semibold bg-black/5 dark:bg-black/30 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                          <span className="text-primary">P: {food.protein}g</span>
                          <span className="text-text-secondary/30">•</span>
                          <span className="text-[#FFD600]">C: {food.carbs}g</span>
                          <span className="text-text-secondary/30">•</span>
                          <span className="text-danger">F: {food.fats}g</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        {!isCompleted ? (
                          <button 
                            onClick={() => {
                              addMeal({
                                name: food.meal,
                                calories: food.calories,
                                protein: food.protein,
                                carbs: food.carbs,
                                fats: food.fats
                              });
                              notifySuccess(`${food.meal} logged successfully!`);
                              addNotification("Meal Logged", `${food.meal} was logged.`, "nutrition", "low");
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs rounded-xl hover:scale-102 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                          >
                            <Plus size={16} /> Log Meal
                          </button>
                        ) : (
                          <span className="w-full py-3.5 bg-primary/10 border border-primary/20 text-primary font-mono text-xs rounded-xl flex items-center justify-center gap-2 font-semibold">
                            <CheckCircle2 size={16} /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default NutritionPage;