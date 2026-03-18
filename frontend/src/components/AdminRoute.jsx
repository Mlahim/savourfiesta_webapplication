import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
    const { token, user, loading } = useContext(AuthContext);

    // Show nothing while auth state is loading
    if (loading) return null;

    if (!token) return <Navigate to="/login" replace />;
    if (user?.role !== 'admin') return <Navigate to="/" replace />;
    return children;
};

export default AdminRoute;
