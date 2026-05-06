import { useState, useEffect } from "react";
import { Save, ShieldAlert, User, Target, Lock, Trash2 } from "lucide-react";
import useUserProfile from "../hooks/useUserProfile";
import { notifySuccess, notifyInfo, notifyError } from "../utils/toast";

const InputField = ({ label, type = "text", value, onChange, gridSpan = "col-span-1" }) => (
  <div className={`relative group ${gridSpan}`}>
    <input 
      type={type} 
      value={value || ""} 
      onChange={onChange} 
      placeholder=" "
      className="block w-full px-5 pb-3 pt-8 bg-black/5 dark:bg-[#030304] border-2 border-black/10 dark:border-white/10 rounded-2xl font-mono text-sm focus:border-primary focus:bg-white dark:focus:bg-[#0F1115] transition-all outline-none peer text-text-primary placeholder:text-text-secondary/40" 
    />
    <label className="absolute font-mono text-[11px] font-semibold text-text-secondary duration-300 transform -translate-y-3 scale-100 top-5 z-10 origin-[0] left-5 peer-placeholder-shown:scale-110 peer-placeholder-shown:-translate-y-1 peer-focus:scale-100 peer-focus:-translate-y-3 peer-focus:text-primary pointer-events-none uppercase tracking-widest">
      {label}
    </label>
  </div>
);

const SelectField = ({ label, value, onChange, options, gridSpan = "col-span-1" }) => (
  <div className={`relative group ${gridSpan}`}>
    <select 
      value={value} 
      onChange={onChange} 
      className="block w-full px-5 pb-3 pt-8 bg-black/5 dark:bg-[#030304] border-2 border-black/10 dark:border-white/10 rounded-2xl font-mono text-sm focus:border-primary focus:bg-white dark:focus:bg-[#0F1115] transition-all outline-none peer appearance-none cursor-pointer text-text-primary"
    >
      {options.map((opt) => <option key={opt.value} value={opt.value} className="bg-card text-text-primary">{opt.label}</option>)}
    </select>
    <label className="absolute font-mono text-[11px] font-semibold text-primary transform -translate-y-3 top-5 z-10 origin-[0] left-5 pointer-events-none uppercase tracking-widest">
      {label}
    </label>
    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
      <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);

const SettingsPage = () => {
  const { profile, updateProfile, resetProfile } = useUserProfile();

  const [fullName, setFullName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [age, setAge] = useState(profile.age || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [height, setHeight] = useState(profile.height || "");
  const [weight, setWeight] = useState(profile.weight || "");
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight || "");

  const [goal, setGoal] = useState(profile.goal || "Muscle Gain");
  const [level, setLevel] = useState(profile.level || "Beginner");
  const [workoutDays, setWorkoutDays] = useState(profile.workoutDays || 5);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (profile) {
      setTimeout(() => {
        setFullName(profile.name || "");
        setEmail(profile.email || "");
        setAge(profile.age || "");
        setGender(profile.gender || "");
        setHeight(profile.height || "");
        setWeight(profile.weight || "");
        setTargetWeight(profile.targetWeight || "");
        setGoal(profile.goal || "Muscle Gain");
        setLevel(profile.level || "Beginner");
        setWorkoutDays(profile.workoutDays || 5);
      }, 0);
    }
  }, [profile]);

  const handleSaveProfile = () => {
    if (!fullName || !height || !weight) {
      notifyError("Please complete required fields");
      return;
    }
    updateProfile({ name: fullName, email, age, gender, height, weight, targetWeight });
    notifySuccess("Profile updated successfully");
  };

  const handleSaveGoals = () => {
    updateProfile({ goal, level, workoutDays });
    notifySuccess("Fitness goals updated");
  };

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword) {
      notifyInfo("Please fill password fields");
      return;
    }
    localStorage.setItem("fitforge_password", newPassword);
    setCurrentPassword("");
    setNewPassword("");
    notifySuccess("Password changed successfully");
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all your data? This action cannot be undone.")) {
      resetProfile();
      notifyInfo("All user profile data reset");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <section className="border-b border-black/5 dark:border-white/10 pb-6">
        <h2 className="font-heading text-4xl font-bold text-text-primary tracking-tight">Settings</h2>
        <p className="text-text-secondary text-sm mt-2">Manage your profile, fitness goals, and application preferences.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white/70 dark:bg-[#0F1115]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="font-heading text-xl font-bold text-text-primary flex items-center gap-2"><User className="text-primary" /> Personal Information</h3>
              <button onClick={handleSaveProfile} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-all shadow-md shadow-primary/10">
                <Save size={16} /> Save
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              <InputField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} gridSpan="md:col-span-2" />
              <InputField label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <InputField label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              <SelectField label="Gender" value={gender} onChange={(e) => setGender(e.target.value)} options={[ {value:"", label:"Select..."}, {value:"Male", label:"Male"}, {value:"Female", label:"Female"}, {value:"Other", label:"Other"} ]} />
              <InputField label="Height (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              <InputField label="Current Weight (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <InputField label="Target Weight (kg)" type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
            </div>
          </section>

          <section className="bg-white/70 dark:bg-[#0F1115]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="font-heading text-xl font-bold text-text-primary flex items-center gap-2"><Target className="text-secondary" /> Fitness Goals</h3>
              <button onClick={handleSaveGoals} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-all shadow-md shadow-primary/10">
                <Save size={16} /> Save
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              <SelectField label="Primary Goal" value={goal} onChange={(e) => setGoal(e.target.value)} options={[ {value:"Muscle Gain", label:"Muscle Gain"}, {value:"Fat Loss", label:"Fat Loss"}, {value:"Strength", label:"Strength"}, {value:"Endurance", label:"Endurance"} ]} gridSpan="md:col-span-2" />
              <SelectField label="Experience Level" value={level} onChange={(e) => setLevel(e.target.value)} options={[ {value:"Beginner", label:"Beginner"}, {value:"Intermediate", label:"Intermediate"}, {value:"Advanced", label:"Advanced"} ]} />
              <SelectField label="Workout Days / Week" value={workoutDays} onChange={(e) => setWorkoutDays(e.target.value)} options={[ {value:"3", label:"3 Days"}, {value:"4", label:"4 Days"}, {value:"5", label:"5 Days"}, {value:"6", label:"6 Days"} ]} />
            </div>
          </section>

        </div>

        <div className="space-y-8">
          <section className="bg-white/70 dark:bg-[#0F1115]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
            <h3 className="font-heading text-xl font-bold text-text-primary flex items-center gap-2 mb-8 relative z-10"><Lock className="text-primary" /> Security</h3>
            <div className="space-y-5 relative z-10">
              <InputField label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <InputField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button onClick={handlePasswordChange} className="w-full py-4 mt-4 bg-white dark:bg-[#030304] border-2 border-black/10 dark:border-white/10 font-mono text-sm text-text-primary uppercase tracking-widest rounded-2xl hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95 font-semibold text-text-primary">
                Update Password
              </button>
            </div>
          </section>

          <section className="bg-danger/5 border-2 border-danger/20 rounded-3xl p-6 md:p-8 shadow-sm hover:border-danger/40 transition-colors">
            <h3 className="font-heading text-xl font-bold text-danger flex items-center gap-2 mb-4"><ShieldAlert className="text-danger" /> Danger Zone</h3>
            <p className="text-text-secondary text-sm mb-8 font-semibold">Resetting your account will permanently delete all personal data, saved plans, and progress.</p>
            <button onClick={handleResetData} className="w-full py-4 bg-danger/10 text-danger font-semibold uppercase tracking-widest text-sm rounded-2xl hover:bg-danger hover:text-white transition-all shadow-md shadow-danger/10 active:scale-95 flex items-center justify-center gap-3">
              <Trash2 size={18} /> Reset Account Data
            </button>
          </section>

        </div>

      </div>
    </div>
  );
};

export default SettingsPage;