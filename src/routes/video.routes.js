import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { uploadVideoAndInfo } from "../controllers/video.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(upload.single("video"),
     uploadVideoAndInfo)

export default router;
