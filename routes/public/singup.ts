import { Router } from "express";
import { signUpController, verifySignupController } from "../../controllers/public/signup";

const router = Router();


router.post("/", signUpController);
router.post("/verification", verifySignupController);


export default router;