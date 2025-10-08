import { Router } from 'express';
import { login, register, refreshToken, forgotPassword, resetPassword, revoke, sendOtp, verifyOtp } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/refresh-token', refreshToken);
// Alias to support clients calling /auth/refresh
router.post('/refresh', refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/revoke', revoke);
// Phone OTP
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

export default router;
