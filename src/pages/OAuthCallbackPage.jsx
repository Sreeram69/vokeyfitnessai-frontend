import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { syncOAuthCallback } from "../api/fitnessApi";
import { handleGoogleLoginCallback } from "../api/authApi";
import { otpVerifiedSuccess } from "../app/slices/authSlice";
import { notifySuccess, notifyError } from "../utils/toast";
import { RefreshCw } from "lucide-react";

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("Establishing secure session...");
  const processedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      notifyError("Authorization code missing. Please try again.");
      navigate("/login");
      return;
    }

    if (processedRef.current) return;
    processedRef.current = true;

    const processOAuth = async () => {
      const isConnectedFlow = !!localStorage.getItem("token");

      try {
        if (isConnectedFlow) {
          setStatus("Connecting Google Fit telemetry...");
          await syncOAuthCallback(code);
          notifySuccess("Successfully connected to Google Fit!");
          navigate("/dashboard");
        } else {
          setStatus("Authenticating Google account details...");
          const res = await handleGoogleLoginCallback(code);
          
          if (res?.success && res?.data) {
            // Save login flag to show the day greeting popup on dashboard mount
            localStorage.setItem("show_day_greeting", "true");
            
            // Dispatch login success
            dispatch(otpVerifiedSuccess(res.data));
            notifySuccess("Google authentication successful!");
            
            // Onboarding check
            const profile = res.data?.profile;
            const hasOnboarded = profile && profile.age && profile.height;
            if (hasOnboarded) {
              navigate("/dashboard");
            } else {
              navigate("/onboarding");
            }
          } else {
            notifyError(res?.message || "Google Authentication failed.");
            navigate("/login");
          }
        }
      } catch (err) {
        console.error(err);
        notifyError(err.response?.data?.message || "OAuth Token Exchange failure.");
        navigate(isConnectedFlow ? "/dashboard" : "/login");
      }
    };

    processOAuth();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
      <div className="p-8 rounded-3xl glass-premium border border-primary/20 shadow-2xl flex flex-col items-center text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-6 text-primary">
          <RefreshCw size={32} className="animate-spin" />
        </div>
        <h2 className="font-heading text-2xl font-black mb-3">Connecting Google</h2>
        <p className="text-xs text-text-secondary font-semibold leading-relaxed mb-4">
          {status}
        </p>
        <p className="text-[10px] text-text-secondary/60 font-medium">
          Please do not close or reload this window.
        </p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
