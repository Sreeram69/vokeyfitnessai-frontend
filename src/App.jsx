import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import ThemeToggle from "./components/ui/ThemeToggle";
import ScrollToTop from "./components/utils/ScrollToTop";
import { fetchUserProfile } from "./app/slices/profileSlice";
import { logout } from "./app/slices/authSlice";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [token, dispatch]);

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout());
    };
    window.addEventListener("fitforge_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("fitforge_unauthorized", handleUnauthorized);
  }, [dispatch]);

  const hideFloatingTogglePaths = [
    "/dashboard",
    "/exercises",
    "/plans",
    "/nutrition",
    "/settings",
    "/favorites",
    "/custom-plan",
  ];
  
  const shouldHideFloatingToggle = hideFloatingTogglePaths.some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 overflow-x-hidden">
      <ScrollToTop />
      {!shouldHideFloatingToggle && (
        <ThemeToggle className="fixed bottom-6 right-6 z-50 p-4 rounded-full glass shadow-2xl shadow-orange-500/20 hover:border-orange-500/50 hover:scale-110 transition-all duration-300" />
      )}
      <AppRoutes />
    </div>
  );
}

export default App;