import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  // Show nothing while auth state is loading to prevent flash
  if (loading) return null;

  // If no token, redirect to login
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
