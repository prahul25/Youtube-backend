import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getSubscribedToChannel, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT)
router
  .route("/c/:channelId")
  .get(
    getSubscribedToChannel /*get channelCount whom subscribed by channel(User)*/
  )
  .post(toggleSubscription /*this subscribe/unsubscribe channel */);

router.route("/s/:subscriberId").get(getUserChannelSubscribers) // through this we will subscriber (who subscribe channel)
router.use(verifyJWT);

export default router;
