import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  addCommentToVideo,
  deleteVideoComment,
  getVideoComments,
  updateVideoComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);

router
.route("/:videoId")
.post(addCommentToVideo)
.get(getVideoComments);

router
  .route("/c/:commentId")
  .patch(updateVideoComment)
  .delete(deleteVideoComment);

export default router;
