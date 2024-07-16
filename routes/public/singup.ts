import { Router } from "express";
import { signUpController, verifySignupController } from "../../controllers/public/signup";
import { rateLimit } from "middleware/ratelimit";

const router = Router();


router.post("/", rateLimit, signUpController);
router.post("/verification", rateLimit, verifySignupController);


export default router;