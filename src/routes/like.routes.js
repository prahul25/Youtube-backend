import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  fetchVideoLikes,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

router.route("/video-likes/:videoId").get(fetchVideoLikes);
export default router;
