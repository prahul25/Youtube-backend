import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updatePassword,
  updateUserAvatar,
  updateUserCoverImage,
  getUserDetails,
  updateAccountDetails,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken); // Generating new refresh token and access token

router.route("/update-password").patch(verifyJWT, updatePassword); // Updating user password

router
  .route("/update-avatarImage")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar); // updating avatar image

router
  .route("/update-coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage); // updating cover image

router.route("/user-details").get(verifyJWT, getUserDetails); // get the user details

router.route("/update-user-details").patch(verifyJWT, updateAccountDetails); // give more control to the user to update fullname , username(entered must be unique) , email

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/history").get(verifyJWT, getWatchHistory);
export default router;
