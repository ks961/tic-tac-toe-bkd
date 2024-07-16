import verifyTokenController from "controllers/public/verifytoken";
import { Router } from "express";
import { rateLimit } from "middleware/ratelimit";

const router = Router();

router.post("/verifytoken", rateLimit, verifyTokenController);


export default router;