

import { loginController, loginForgotPasswordController, loginForgotPasswordVerifyOtpController, updatePasswordController } from "controllers/public/login";
import { Router } from "express";

const router = Router();

router.post("/", loginController);
router.post("/forgot-password", loginForgotPasswordController);
router.post("/forgot-password/verification", loginForgotPasswordVerifyOtpController);

router.put("/update-password", updatePasswordController);

export default router;