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
  updateAccountDetails
} from "../controllers/user.controllers.js";
import {
  upload,
  uploadSingleAvatar,
  uploadSingleCover,
} from "../middlewares/multer.middlewares.js";
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

router.route("/update-password").post(verifyJWT , updatePassword); // Updating user password

router
  .route("/update-avatarImage")
  .post(verifyJWT, uploadSingleAvatar, updateUserAvatar); // updating avatar image

router
  .route("/update-coverImage")
  .post(verifyJWT, uploadSingleCover, updateUserCoverImage); // updating cover image

router.route("/user-details").get(verifyJWT, getUserDetails) // get the user details

router.route("/update-user-details").patch(verifyJWT , updateAccountDetails) // give more control to the user to update fullname , username(entered must be unique) , email
export default router;
