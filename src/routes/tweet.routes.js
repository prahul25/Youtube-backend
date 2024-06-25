import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createTweet, getUserTweet, removeTweet, updateTweet } from "../controllers/tweet.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/").post(createTweet)
router.route("/:tweetId").patch(updateTweet).delete(removeTweet)
router.route("/user/:userId").get(getUserTweet)
export default router