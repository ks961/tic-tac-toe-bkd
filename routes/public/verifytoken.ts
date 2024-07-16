import verifyTokenController from "controllers/public/verifytoken";
import { Router } from "express";

const router = Router();

router.post("/verifytoken", verifyTokenController);


export default router;