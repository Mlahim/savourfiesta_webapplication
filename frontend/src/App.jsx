import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import TopBanner from "./components/TopBanner";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrdersList from "./pages/AdminOrdersList";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";

import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/signup", "/verify-email", "/forgot-password", "/reset-password"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      {showNavbar && (
        <div className="sticky top-0 z-50">
          <TopBanner />
          <Navbar />
        </div>
      )}
      {children}
      {showNavbar && <Footer />}
      <FloatingWhatsApp />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ duration: 1500 }} />
        <Layout>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders/:status"
              element={
                <AdminRoute>
                  <AdminOrdersList />
                </AdminRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
