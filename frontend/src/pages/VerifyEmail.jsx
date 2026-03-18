import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { KeyRound, Mail, RefreshCw, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: setAuth } = useContext(AuthContext);

    const [email] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(60);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post("/auth/verify-email", { email, otp });
            const { token, user } = res.data;

            // Auto-login
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            setSuccess(true);
            toast.success("Email verified! Welcome!");
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await axios.post("/auth/resend-otp", { email });
            toast.success("New OTP sent to your email!");
            setCountdown(60);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to resend OTP");
        } finally {
            setIsResending(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-orange-100 via-white to-red-50 px-4">
                <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl text-center border border-white/50">
                    <h2 className="text-2xl font-black text-gray-800 mb-4">No email provided</h2>
                    <p className="text-gray-500 mb-6">Please sign up first.</p>
                    <button onClick={() => navigate("/signup")} className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-8 rounded-2xl">Go to Signup</button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-orange-100 via-white to-red-50 px-4">
                <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl space-y-6 border border-white/50 text-center w-full max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={36} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800">
                        Email <span className="text-green-600">Verified!</span>
                    </h2>
                    <p className="text-gray-500">Redirecting to home page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-orange-100 via-white to-red-50 px-4 overflow-hidden relative">
            <div className="absolute top-20 left-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

            <div className="relative w-full max-w-md">
                <form
                    className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl space-y-6 border border-white/50"
                    onSubmit={handleVerify}
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black tracking-tight text-gray-800">
                            Verify <span className="text-orange-600">Email</span>
                        </h2>
                        <p className="text-gray-500 font-medium">
                            We sent a code to <span className="font-bold text-gray-700">{email}</span>
                        </p>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                            <KeyRound size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full bg-white/50 border-2 border-gray-100 pl-12 p-4 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all duration-300 shadow-sm tracking-widest text-lg font-bold text-center"
                            required
                            maxLength={6}
                        />
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-400 hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCw className="animate-spin" size={20} /> Verifying...
                            </span>
                        ) : "Verify Email"}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Didn't receive the code?{" "}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending || countdown > 0}
                            className="text-orange-600 font-bold hover:underline disabled:opacity-50"
                        >
                            {isResending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
