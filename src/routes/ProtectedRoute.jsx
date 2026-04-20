import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isOtpPending } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isOtpPending) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if onboarding is completed
  const userProfile = localStorage.getItem("fitforge_user_profile");
  const parsedProfile = userProfile ? JSON.parse(userProfile) : null;
  const isOnboarded = parsedProfile && parsedProfile.age && parsedProfile.height;

  const reduxUser = useSelector((state) => state.auth.user);
  const isAdmin = reduxUser?.role === "admin" || parsedProfile?.role === "admin";

  if (isAdmin && !location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!isOnboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (isOnboarded && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;