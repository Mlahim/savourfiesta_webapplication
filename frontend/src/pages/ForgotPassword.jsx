import React, { useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post("/auth/forgot-password", { email });
            toast.success("OTP sent! Check your email.");
            // Pass email to the reset page so user doesn't have to type it again
            navigate("/reset-password", { state: { email } });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
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
                            Forgot <span className="text-orange-600">Password</span>
                        </h2>
                        <p className="text-gray-500 font-medium">Enter your email and we'll send you an OTP</p>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/50 border-2 border-gray-100 pl-12 p-4 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all duration-300 shadow-sm"
                            required
                        />
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-400 hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCw className="animate-spin" size={20} /> Sending...
                            </span>
                        ) : "Send OTP"}
                    </button>

                    <Link
                        to="/login"
                        className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> Back to Login
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
