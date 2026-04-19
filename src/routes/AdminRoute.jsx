import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageLoader from "../components/ui/PageLoader";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const reduxUser = useSelector((state) => state.auth.user);
  const userProfile = JSON.parse(localStorage.getItem("fitforge_user_profile") || "null");

  if (token && !reduxUser && !userProfile) {
    return <PageLoader />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = reduxUser?.role === "admin" || userProfile?.role === "admin";
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;