import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, LogIn, CheckCircle2, AlertTriangle } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loggedInUser = await login(form.email, form.password);
      setSubmitStatus("success");
      setSubmitMessage("Login successful!");
      
      setTimeout(() => {
        if (loggedInUser?.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setSubmitStatus("error");
      
      if (err.response?.status === 403 && err.response?.data?.needsVerification) {
        setSubmitMessage("Please verify your email first");
        setTimeout(() => navigate("/verify-email", { state: { email: err.response.data.email } }), 2000);
      } else {
        setSubmitMessage(err.response?.data?.message || err.message || "Error logging in");
        setTimeout(() => setSubmitStatus("idle"), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-orange-100 via-white to-red-50 px-4 overflow-hidden relative">
      <div className="absolute top-20 left-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

      <div className="relative w-full max-w-md">
        <form
          className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl space-y-6 border border-white/50"
          onSubmit={handleSubmit}
        >
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black tracking-tight text-gray-800">
              Welcome <span className="text-orange-600">Back</span>
            </h2>
            <p className="text-gray-500 font-medium">Please login to continue</p>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                <Mail size={20} />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-white/50 border-2 border-gray-100 pl-12 p-4 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all duration-300 shadow-sm"
                required
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-white/50 border-2 border-gray-100 pl-12 pr-12 p-4 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all duration-300 shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <div className="text-right -mt-2">
            <Link
              to="/forgot-password"
              className="text-sm text-orange-600 font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || submitStatus === "success"}
            className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 ${
              submitStatus === "success" ? "bg-gradient-to-r from-orange-600 to-red-700 shadow-orange-500/50 scale-105" :
              submitStatus === "error" ? "bg-red-600 shadow-red-500/50" :
              "bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 shadow-orange-200 hover:shadow-orange-400 hover:-translate-y-1 active:scale-95"
            }`}
          >
            {submitStatus === "success" ? (
              <><CheckCircle2 size={20} /> {submitMessage}</>
            ) : submitStatus === "error" ? (
              <><AlertTriangle size={20} /> {submitMessage}</>
            ) : (
              <><LogIn size={20} /> {isLoading ? "Logging in..." : "Login"}</>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <User size={18} /> Continue as Guest
          </button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-orange-600 font-bold hover:underline"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
