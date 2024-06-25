import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  getPlaylist,
  getUserPlaylists,
  removePlaylist,
  removeVideoToPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").post(createPlaylist);
router
  .route("/:playlistId")
  .patch(updatePlaylist)
  .delete(removePlaylist)
  .get(getPlaylist); // update playlist details

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist); // add to playlist
router.route("/remove/:videoId/:playlistId").patch(removeVideoToPlaylist); // remove video from playlist
router.route("/user/:userId").get(getUserPlaylists); // we have use here aggregation pipline
export default router;
