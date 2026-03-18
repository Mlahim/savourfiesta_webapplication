const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../config/nodemailer');

// Helper to generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if verified user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: "User already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOtp();

        if (existingUser && !existingUser.isVerified) {
            // Update existing unverified user
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.otp = hashOtp(otp);
            existingUser.otpExpires = Date.now() + 60 * 1000;
            await existingUser.save();
        } else {
            // Create unverified user
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role: 'user',
                isVerified: false,
                otp: hashOtp(otp),
                otpExpires: Date.now() + 60 * 1000
            });
            await newUser.save();
        }

        // Send verification OTP email
        await sendEmail({
            to: email,
            subject: 'Verify Your Email - SavourFiesta',
            html: `
                <h1>Email Verification</h1>
                <p>Thank you for signing up! Your verification code is:</p>
                <h2 style="color: #ea580c; letter-spacing: 5px;">${otp}</h2>
                <p>This code will expire in 60 seconds.</p>
            `
        });

        res.status(200).json({
            message: 'Verification OTP sent to your email',
            email
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Signup failed", error: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email,
            otp: hashOtp(otp),
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Mark as verified and clear OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Auto-login: generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Email verified successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email, isVerified: false });

        if (!user) {
            return res.status(400).json({ message: "User not found or already verified" });
        }

        const otp = generateOtp();
        user.otp = hashOtp(otp);
        user.otpExpires = Date.now() + 60 * 1000;
        await user.save();

        await sendEmail({
            to: email,
            subject: 'Resend OTP - SavourFiesta',
            html: `
                <h1>Email Verification</h1>
                <p>Your new verification code is:</p>
                <h2 style="color: #ea580c; letter-spacing: 5px;">${otp}</h2>
                <p>This code will expire in 60 seconds.</p>
            `
        });

        res.status(200).json({ message: "OTP resent to your email" });
    } catch (error) {
        res.status(500).json({ message: "Failed to resend OTP", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first",
                needsVerification: true,
                email
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login Successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email, isVerified: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOtp();
        user.resetPasswordToken = hashOtp(otp);
        user.resetPasswordExpires = Date.now() + 60 * 1000;
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'Password Reset OTP - SavourFiesta',
            html: `
                <h1>Password Reset OTP</h1>
                <p>You requested a password reset. Your OTP code is:</p>
                <h2 style="color: #ea580c; letter-spacing: 5px;">${otp}</h2>
                <p>This code will expire in 60 seconds.</p>
            `
        });

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Email could not be sent", error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordToken: hashOtp(otp),
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid OTP or expired" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: "Password reset failed", error: error.message });
    }
};

exports.resendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email, isVerified: true });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const otp = generateOtp();
        user.resetPasswordToken = hashOtp(otp);
        user.resetPasswordExpires = Date.now() + 60 * 1000;
        await user.save();

        await sendEmail({
            to: email,
            subject: 'Password Reset OTP - SavourFiesta',
            html: `
                <h1>Password Reset OTP</h1>
                <p>Your new password reset code is:</p>
                <h2 style="color: #ea580c; letter-spacing: 5px;">${otp}</h2>
                <p>This code will expire in 60 seconds.</p>
            `
        });

        res.status(200).json({ message: "OTP resent to your email" });
    } catch (error) {
        res.status(500).json({ message: "Failed to resend OTP", error: error.message });
    }
};