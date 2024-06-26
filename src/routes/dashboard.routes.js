import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getUserUploadedVideos, getUserDashboard } from "../controllers/dashboard.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/stats").get(getUserDashboard)

router.route("/videos").get(getUserUploadedVideos)

export default router