

import { loginController, loginForgotPasswordController, loginForgotPasswordVerifyOtpController, updatePasswordController } from "controllers/public/login";
import { Router } from "express";
import { rateLimit } from "middleware/ratelimit";

const router = Router();

router.post("/", loginController);
router.post("/forgot-password", rateLimit, loginForgotPasswordController);
router.post("/forgot-password/verification", rateLimit, loginForgotPasswordVerifyOtpController);

router.put("/update-password", updatePasswordController);

export default router;