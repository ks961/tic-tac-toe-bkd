import { otpVerificationController } from "controllers/public/otp";
import { Router } from "express";


const router = Router();

router.post("/verify", otpVerificationController);

export default router;