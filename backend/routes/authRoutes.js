const router = require('express').Router();
const { signup, login, verifyEmail, resendOtp, forgotPassword, resetPassword, resendResetOtp } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-reset-otp', resendResetOtp);

module.exports = router;
