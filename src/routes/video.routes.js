import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  deleteVideo,
  getAllVideos,
  updateVideoDetails,
  uploadVideoAndInfo,
  videoById,
} from "../controllers/video.controller.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/")
  .post(upload.single("video"), uploadVideoAndInfo)
  .get(getAllVideos);

router
  .route("/:videoId")
  .get(videoById)
  .patch(updateVideoDetails)
  .delete(deleteVideo);
export default router;
