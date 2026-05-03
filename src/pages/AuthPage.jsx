import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dumbbell, ArrowLeft, Loader2, CheckCircle2, KeyRound, Eye, EyeOff } from "lucide-react";
import { loginUser, registerUser, clearError, otpVerifiedSuccess } from "../app/slices/authSlice";
import { notifySuccess, notifyError } from "../utils/toast";
import { verifyOtp, resendOtp, forgotPassword, resetPassword, getGoogleLoginUrl } from "../api/authApi";

const AuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated, isOtpPending, tempUser } = useSelector((state) => state.auth);

  const [view, setView] = useState(() => {
    if (location.pathname === "/verify-login-otp") {
      return "otp";
    }
    return location.pathname === "/register" ? "register" : "login";
  });



  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  
  const [otpData, setOtpData] = useState(["", "", "", "", "", ""]);
  const [resetPasswords, setResetPasswords] = useState({ password: "", confirmPassword: "" });
  
  const [otpLoading, setOtpLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const res = await getGoogleLoginUrl();
      if (res?.success && res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        notifyError("Failed to initialize Google Authentication");
      }
    } catch (err) {
      console.error(err);
      notifyError("Failed to initiate Google OAuth redirect sequence");
    } finally {
      setGoogleLoading(false);
    }
  };

  const changeView = (newView) => {
    dispatch(clearError());
    setValidationError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setView(newView);

    // Safely update the URL address bar in real-time without triggering a router unmount/remount
    if (newView === "login") {
      window.history.pushState(null, "", "/login");
    } else if (newView === "register") {
      window.history.pushState(null, "", "/register");
    } else if (newView === "otp") {
      window.history.pushState(null, "", "/verify-login-otp");
    }
  };

  // Handle automatic routing if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isOtpPending) {
      const userProfile = localStorage.getItem("fitforge_user_profile");
      const parsedProfile = userProfile ? JSON.parse(userProfile) : null;
      const isOnboarded = parsedProfile && parsedProfile.age && parsedProfile.height;
      if (isOnboarded) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, isOtpPending, navigate]);

  // Timer countdown for OTP resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setValidationError("");
  };

  const handleResetPasswordsChange = (e) => {
    setResetPasswords({ ...resetPasswords, [e.target.name]: e.target.value });
    setValidationError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setOtpData(["", "", "", "", "", ""]);
    const resultAction = await dispatch(loginUser(loginData));
    if (loginUser.fulfilled.match(resultAction)) {
      const payload = resultAction.payload;
      if (payload.needsVerification) {
        setResendCooldown(30); // start cooldown on send
        notifySuccess("Verification code sent successfully!");
        changeView("otp");
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    setOtpData(["", "", "", "", "", ""]);
    const payload = {
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
    };
    const resultAction = await dispatch(registerUser(payload));
    if (resultAction && registerUser.fulfilled.match(resultAction)) {
      const payload = resultAction.payload;
      if (payload.needsVerification) {
        setResendCooldown(30); // start cooldown on send
        notifySuccess("Verification code sent successfully!");
        changeView("otp");
      }
    }
  };

  const handleOtpChange = (index, value, prefix = "otp") => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otpData];
    newOtp[index] = value;
    setOtpData(newOtp);

    if (value && index < 5) {
      document.getElementById(`${prefix}-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e, prefix = "otp") => {
    if (e.key === 'Backspace' && !otpData[index] && index > 0) {
      document.getElementById(`${prefix}-${index - 1}`).focus();
    }
  };

  const handlePaste = (e, prefix = "otp") => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpData(digits);
      document.getElementById(`${prefix}-5`).focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otpData.join("");
    if (code.length < 6) {
      notifyError("Please enter the 6-digit code");
      return;
    }

    const email = tempUser?.email || loginData.email || registerData.email;

    try {
      setOtpLoading(true);
      const res = await verifyOtp(code, email, "email_verification");
      if (res?.success) {
        notifySuccess("Email verified successfully!");
        dispatch(otpVerifiedSuccess(res.data));
        const profile = res.data?.user?.profile || res.data?.profile;
        const hasOnboarded = profile && profile.age && profile.height;
        if (hasOnboarded) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } else {
        notifyError(res?.message || "Invalid or expired verification code");
      }
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    const email = tempUser?.email || loginData.email || registerData.email;
    try {
      const res = await resendOtp(email, "email_verification");
      if (res?.success) {
        setResendCooldown(30);
        notifySuccess("New verification code sent successfully!");
      } else {
        notifyError(res?.message || "Failed to resend code");
      }
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Resend failed. Please try again.");
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      notifyError("Please enter your email address");
      return;
    }
    try {
      setOtpLoading(true);
      setOtpData(["", "", "", "", "", ""]);
      const res = await forgotPassword(forgotEmail);
      if (res?.success) {
        notifySuccess("Reset code sent! Please check your email.");
        setResendCooldown(30);
        changeView("reset-password");
      }
    } catch (err) {
      notifyError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const code = otpData.join("");
    if (code.length < 6) {
      notifyError("Please enter the 6-digit code");
      return;
    }
    if (resetPasswords.password !== resetPasswords.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    try {
      setOtpLoading(true);
      const res = await resetPassword(forgotEmail, code, resetPasswords.password);
      if (res?.success) {
        notifySuccess("Password updated successfully! Please log in.");
        changeView("login");
      }
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleForgotPasswordResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await resendOtp(forgotEmail, "password_reset");
      if (res?.success) {
        setResendCooldown(30);
        notifySuccess("New reset code sent successfully!");
      }
    } catch (err) {
      notifyError(err.response?.data?.message || "Resend failed.");
    }
  };

  // 3D Perspective card rotations
  let rotateY = 0;
  if (view === "register") rotateY = -180;
  else if (view === "forgot-password") rotateY = 180;
  else if (view === "reset-password") rotateY = -180;

  // Dynamic height mapping based on active view and state to prevent border clipping
  let cardHeight = "500px";
  if (view === "register") {
    cardHeight = (error || validationError) ? "680px" : "630px";
  } else if (view === "forgot-password") {
    cardHeight = "400px";
  } else if (view === "reset-password") {
    cardHeight = (validationError) ? "500px" : "450px";
  }

  return (
    <div className="h-screen overflow-hidden flex bg-bg text-text-primary selection:bg-primary/20 selection:text-primary">

      {/* Left side: Premium Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-card overflow-hidden items-center justify-center p-20 border-r border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-bg to-bg pointer-events-none opacity-50" />

        <div className="relative z-10 w-full max-w-xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 shadow-sm">
            <Dumbbell className="text-primary" size={32} />
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6 leading-[1.05]">
            Intelligence applied to <br /><span className="text-primary">human performance.</span>
          </h1>
          <p className="text-lg text-text-secondary font-medium leading-relaxed max-w-md">
            Join the premium platform for AI-driven fitness, personalized routines, and elegant progress tracking.
          </p>
        </div>
      </div>

      {/* Right side: Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-bg" style={{ perspective: "1200px" }}>

        <div
          className="w-full max-w-md relative z-10 transition-all duration-700 ease-in-out"
          style={{ transformStyle: "preserve-3d", transform: `rotateY(${rotateY}deg)`, height: cardHeight }}
        >

          {/* FRONT CARD (LOGIN & OTP) */}
          <div
            className="absolute inset-0 w-full h-full flex flex-col justify-center transition-opacity duration-300 premium-card bg-card border border-border rounded-3xl shadow-xl p-8 sm:p-10"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              opacity: (view === "login" || view === "otp") ? 1 : 0,
              pointerEvents: (view === "login" || view === "otp") ? "auto" : "none"
            }}
          >
            {view === "otp" ? (
              <div className="w-full">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-success/10 border border-success/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle2 size={32} className="text-success" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-text-primary mb-3 tracking-tight">Verify Email</h2>
                  <p className="text-text-secondary font-medium">We've sent a 6-digit code to <br /><span className="text-text-primary font-bold">{tempUser?.email || loginData.email || registerData.email || "your email"}</span>.</p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-8">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpData.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value, "otp")}
                        onKeyDown={(e) => handleOtpKeyDown(index, e, "otp")}
                        onPaste={(e) => handlePaste(e, "otp")}
                        className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-extrabold rounded-xl bg-bg border border-border text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-4 flex items-center justify-center gap-2 rounded-xl btn-primary font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Continue"}
                  </button>
                </form>

                <p className="text-text-secondary font-bold text-center mt-8 text-xs uppercase tracking-wider">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleResendOtp}
                    className="text-primary hover:text-primary/80 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                  </button>
                </p>
              </div>
            ) : (
              <div className="w-full">
                <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-primary transition mb-5 w-max bg-card px-4 py-2 rounded-full border border-border shadow-sm">
                  <ArrowLeft size={14} /> Back
                </Link>

                <h2 className="text-2xl font-extrabold text-text-primary mb-1 tracking-tight">Welcome Back</h2>
                <p className="text-text-secondary font-semibold mb-4 text-xs">Enter your credentials to access your account.</p>

                {error && view === "login" && (
                  <div className="mb-4 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold shadow-sm">
                    {error}
                  </div>
                )}

                <form className="space-y-3" onSubmit={handleLoginSubmit}>
                  <div className="relative group">
                    <input
                      type="email" name="email" value={loginData.email} onChange={handleLoginChange} placeholder=" " required
                      className="block w-full px-5 pb-2.5 pt-6 bg-card border border-border rounded-xl font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none peer shadow-sm"
                    />
                    <label className="absolute left-5 top-2.5 text-[8px] font-bold text-text-secondary transition-all duration-300 pointer-events-none uppercase tracking-widest peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2.5 peer-focus:text-[8px] peer-focus:text-primary z-10">
                      Email Address
                    </label>
                  </div>

                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"} name="password" value={loginData.password} onChange={handleLoginChange} placeholder=" " required
                      className="block w-full px-5 pb-2.5 pt-6 bg-card border border-border rounded-xl font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none peer shadow-sm pr-[120px]"
                    />
                    <label className="absolute left-5 top-2.5 text-[8px] font-bold text-text-secondary transition-all duration-300 pointer-events-none uppercase tracking-widest peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2.5 peer-focus:text-[8px] peer-focus:text-primary z-10">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-[21px] right-[72px] text-[#64748B] dark:text-[#94A3B8] hover:text-primary z-20 bg-transparent border-none cursor-pointer outline-none transition-colors p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => changeView("forgot-password")}
                      className="absolute top-[25px] right-5 text-[9px] font-bold text-primary hover:text-primary/80 z-20 uppercase tracking-widest bg-transparent border-none cursor-pointer outline-none"
                    >
                      FORGOT?
                    </button>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full py-3 mt-2 flex items-center justify-center gap-2 rounded-xl btn-primary font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading && view === "login" ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
                  </button>

                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/60"></div>
                    </div>
                    <span className="relative px-4 text-[9px] font-extrabold uppercase tracking-widest text-text-secondary bg-[var(--bg-card)]">Or continue with</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="w-full py-3 flex items-center justify-center gap-3 rounded-xl border border-border bg-card font-bold text-xs text-text-primary transition-all duration-300 shadow-sm hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:shadow-primary/10 hover:shadow-lg active:scale-98 disabled:opacity-70 group cursor-pointer outline-none"
                  >
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.465 2.115 15.595 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.555-4.455 10.555-10.74 0-.725-.08-1.285-.175-1.975H12.24z"
                      />
                    </svg>
                    <span>{googleLoading ? "Connecting Google..." : "Google Account"}</span>
                  </button>
                </form>

                <p className="text-text-secondary font-semibold text-center mt-4 text-xs">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => changeView("register")} className="text-primary font-bold hover:text-primary/80 transition cursor-pointer bg-transparent border-none outline-none p-0 text-xs">
                    Create one now
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* BACK CARD (REGISTER) */}
          <div
            className="absolute inset-0 w-full h-full flex flex-col justify-center transition-opacity duration-300 premium-card bg-card border border-border rounded-3xl shadow-xl p-8 sm:p-10"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              opacity: view === "register" ? 1 : 0,
              pointerEvents: view === "register" ? "auto" : "none"
            }}
          >
            <div className="w-full">
              <button
                onClick={() => changeView("login")}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-primary transition mb-3 w-max bg-card px-3.5 py-1.5 rounded-full border border-border shadow-sm cursor-pointer outline-none"
              >
                <ArrowLeft size={12} /> Back
              </button>

              <h2 className="text-2xl font-extrabold text-text-primary mb-1 tracking-tight">Create Account</h2>
              <p className="text-text-secondary font-semibold mb-4 text-xs">Start your fitness transformation today.</p>

              {(error || validationError) && view === "register" && (
                <div className="mb-3.5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold shadow-sm">
                  {validationError || error}
                </div>
              )}

              <form className="space-y-2.5" onSubmit={handleRegisterSubmit}>
                <div className="relative group">
                  <input
                    type="text" name="username" value={registerData.username} onChange={handleRegisterChange} placeholder=" " required
                    className="block w-full px-5 pb-2.5 pt-6 bg-card border border-border rounded-xl font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none peer shadow-sm"
                  />
                  <label className="absolute left-5 top-2.5 text-[8px] font-bold text-text-secondary transition-all duration-300 pointer-events-none uppercase tracking-widest peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2.5 peer-focus:text-[8px] peer-focus:text-primary z-10">
                    Full Name
                  </label>
                </div>

                <div className="relative group">
                  <input
                    type="email" name="email" value={registerData.email} onChange={handleRegisterChange} placeholder=" " required
                    className="block w-full px-5 pb-2.5 pt-6 bg-card border border-border rounded-xl font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none peer shadow-sm"
                  />
                  <label className="absolute left-5 top-2.5 text-[8px] font-bold text-text-secondary transition-all duration-300 pointer-events-none uppercase tracking-widest peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2.5 peer-focus:text-[8px] peer-focus:text-primary z-10">
                    Email Address
                  </label>
                </div>

                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={registerData.password} onChange={handleRegisterChange} placeholder=" " required
                    className="block w-full px-5 pb-2.5 pt-6 bg-card border border-border rounded-xl font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none peer shadow-sm pr-12"
                  />
                  <label className="absolute left-5 top-2.5 text-[8px] font-bold text-text-secondary transition-all duration-300 pointer-events-none uppercase tracking-widest peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2.5 peer-focus:text-[8px] peer-focus:text-primary z-10">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-[21px] right-5 text-[#64748B] dark:text-[#94A3B8] hover:text-primary z-20 bg-transparent border-none cursor-pointer outline-none transition-colors p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={registerData.confirmPassword} onChange={handleRegisterChange} placeholder=" " required
                    className="block w-full px-5 pb-2.5 pt-6 bg-card border border-border rounded-xl font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none peer shadow-sm pr-12"
                  />
                  <label className="absolute left-5 top-2.5 text-[8px] font-bold text-text-secondary transition-all duration-300 pointer-events-none uppercase tracking-widest peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2.5 peer-focus:text-[8px] peer-focus:text-primary z-10">
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-[21px] right-5 text-[#64748B] dark:text-[#94A3B8] hover:text-primary z-20 bg-transparent border-none cursor-pointer outline-none transition-colors p-1"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 mt-2 flex items-center justify-center gap-2 rounded-xl btn-primary font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading && view === "register" ? <Loader2 className="animate-spin" size={18} /> : "Sign Up"}
                </button>

                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60"></div>
                  </div>
                  <span className="relative px-4 text-[9px] font-extrabold uppercase tracking-widest text-text-secondary bg-[var(--bg-card)]">Or continue with</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full py-3 flex items-center justify-center gap-3 rounded-xl border border-border bg-card font-bold text-xs text-text-primary transition-all duration-300 shadow-sm hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:shadow-primary/10 hover:shadow-lg active:scale-98 disabled:opacity-70 group cursor-pointer outline-none"
                >
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.465 2.115 15.595 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.555-4.455 10.555-10.74 0-.725-.08-1.285-.175-1.975H12.24z"
                    />
                  </svg>
                  <span>{googleLoading ? "Connecting Google..." : "Google Account"}</span>
                </button>
              </form>

              <p className="text-text-secondary font-semibold text-center mt-4 text-xs">
                Already have an account?{" "}
                <button type="button" onClick={() => changeView("login")} className="text-primary font-bold hover:text-primary/80 transition cursor-pointer bg-transparent border-none outline-none p-0 text-xs">
                  Log in instead
                </button>
              </p>
            </div>
          </div>

          {/* BACK CARD (FORGOT PASSWORD) */}
          <div
            className="absolute inset-0 w-full h-full flex flex-col justify-center transition-opacity duration-300 premium-card bg-card border border-border rounded-3xl shadow-xl p-8 sm:p-10"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(-180deg)",
              opacity: view === "forgot-password" ? 1 : 0,
              pointerEvents: view === "forgot-password" ? "auto" : "none"
            }}
          >
            <div className="w-full">
              <button
                onClick={() => changeView("login")}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-primary transition mb-6 w-max bg-card px-4 py-2 rounded-full border border-border shadow-sm cursor-pointer outline-none"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <KeyRound size={24} className="text-primary" />
              </div>

              <h2 className="text-3xl font-extrabold text-text-primary mb-2 tracking-tight">Forgot Password</h2>
              <p className="text-text-secondary font-medium mb-6 text-base">Enter your email and we'll send you an OTP calibration code.</p>

              <form className="space-y-5" onSubmit={handleForgotPasswordSubmit}>
                <div className="relative group">
                  <input
                    type="email" name="forgotEmail" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder=" " required
                    className="block w-full px-5 pb-3 pt-8 bg-card border border-border rounded-xl font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none peer shadow-sm"
                  />
                  <label className="absolute left-5 top-3.5 text-[9px] font-bold text-text-secondary transition-all duration-300 pointer-events-none uppercase tracking-widest peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-3.5 peer-focus:text-[9px] peer-focus:text-primary z-10">
                    Email Address
                  </label>
                </div>

                <button
                  type="submit" disabled={otpLoading}
                  className="w-full py-4 flex items-center justify-center gap-2 rounded-xl btn-primary font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {otpLoading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Code"}
                </button>
              </form>
            </div>
          </div>

          {/* BACK CARD (RESET PASSWORD) */}
          <div
            className="absolute inset-0 w-full h-full flex flex-col justify-center transition-opacity duration-300 premium-card bg-card border border-border rounded-3xl shadow-xl p-8 sm:p-10 max-h-[650px] overflow-y-auto"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              opacity: view === "reset-password" ? 1 : 0,
              pointerEvents: view === "reset-password" ? "auto" : "none"
            }}
          >
            <div className="w-full">
              <button
                onClick={() => changeView("forgot-password")}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-primary transition mb-4 w-max bg-card px-4 py-2 rounded-full border border-border shadow-sm cursor-pointer outline-none"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-1 tracking-tight">Reset Password</h2>
              <p className="text-text-secondary font-medium mb-4 text-xs">Enter the code sent to <span className="text-text-primary font-bold">{forgotEmail}</span> and configure a new password.</p>

              {validationError && (
                <div className="mb-4 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-semibold shadow-sm">
                  {validationError}
                </div>
              )}

              <form className="space-y-3.5" onSubmit={handleResetPasswordSubmit}>
                {/* OTP block inputs */}
                <div className="flex justify-center gap-2 mb-2">
                  {otpData.map((digit, index) => (
                    <input
                      key={index}
                      id={`reset-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value, "reset-otp")}
                      onKeyDown={(e) => handleOtpKeyDown(index, e, "reset-otp")}
                      onPaste={(e) => handlePaste(e, "reset-otp")}
                      className="w-10 h-12 text-center text-xl font-extrabold rounded-xl bg-bg border border-border text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>

                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={resetPasswords.password} onChange={handleResetPasswordsChange} placeholder=" " required
                    className="block w-full px-5 pb-2 pt-6 bg-card border border-border rounded-xl font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none peer shadow-sm pr-12"
                  />
                  <label className="absolute left-5 top-2 text-[9px] font-bold text-text-secondary transition-all duration-300 pointer-events-none uppercase tracking-widest peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-primary z-10">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-[22px] right-5 text-[#64748B] dark:text-[#94A3B8] hover:text-primary z-20 bg-transparent border-none cursor-pointer outline-none transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={resetPasswords.confirmPassword} onChange={handleResetPasswordsChange} placeholder=" " required
                    className="block w-full px-5 pb-2 pt-6 bg-card border border-border rounded-xl font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none peer shadow-sm pr-12"
                  />
                  <label className="absolute left-5 top-2 text-[9px] font-bold text-text-secondary transition-all duration-300 pointer-events-none uppercase tracking-widest peer-placeholder-shown:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-primary z-10">
                    Confirm New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-[22px] right-5 text-[#64748B] dark:text-[#94A3B8] hover:text-primary z-20 bg-transparent border-none cursor-pointer outline-none transition-colors"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  type="submit" disabled={otpLoading}
                  className="w-full py-4 flex items-center justify-center gap-2 rounded-xl btn-primary font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {otpLoading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
                </button>
              </form>

              <p className="text-text-secondary font-bold text-center mt-4 text-xs uppercase tracking-wider">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleForgotPasswordResend}
                  className="text-primary hover:text-primary/80 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;