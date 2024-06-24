import mongoose, { Schema } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { videoId } = req.params;

  try {
    const existingLike = await Like.findOne({ likedBy: _id, video: videoId });
  
    if (existingLike) {
      const unlikedVideo = await Like.findOneAndDelete({
        likedBy: _id,
        video: videoId,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(200, unlikedVideo, "Video dislike toggled successfully")
        );
    } else {
      const likedVideo = await Like.create({
        likedBy: _id,
        video: videoId,
      });
  
      return res
        .status(200)
        .json(
          new ApiResponse(200, likedVideo, "Video liked toggled successfully")
        );
    }
  } catch (error) {
    throw new ApiError(500, null, "An error occurred while toggling the like")
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { commentId } = req.params;
  
    try {
      const existingComment = await Like.findOne({ likedBy: _id, comment: commentId });
    
      if (existingComment) {
        const unlikedComment = await Like.findOneAndDelete({ likedBy: _id, comment: commentId });
        return res
          .status(200)
          .json(
            new ApiResponse(200, unlikedComment, "Comment dislike toggled successfully")
          );
      } else {
        const likedComment = await Like.create({ likedBy: _id, comment: commentId });
    
        return res
          .status(200)
          .json(
            new ApiResponse(200, likedComment, "Comment liked toggled successfully")
          );
      }
    } catch (error) {
      throw new ApiError(500, null, "An error occurred while toggling the like")
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { tweetId } = req.params;
  
    try {
      const existingTweet = await Like.findOne({ likedBy: _id, tweet: tweetId });
    
      if (existingTweet) {
        const unlikedTweet = await Like.findOneAndDelete({ likedBy: _id, tweet: tweetId });
        return res
          .status(200)
          .json(
            new ApiResponse(200, unlikedTweet, "Tweet dislike toggled successfully")
          );
      } else {
        const likedTweet = await Like.create({ likedBy: _id, tweet: tweetId });
    
        return res
          .status(200)
          .json(
            new ApiResponse(200, likedTweet, "Tweet liked toggled successfully")
          );
      }
    } catch (error) {
      throw new ApiError(500, null, "An error occurred while toggling the like")
    }
});

const fetchVideoLikes = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const like = await Like.aggregate([
        {
          $match: {
            video:new mongoose.Types.ObjectId(videoId)
          }
        },
        {
            $group: {
                _id: "$video",
                count: { $sum: 1 }
            }
        },
        {
                $project: {
                    _id: 0,
                    videoId: "$_id",
                    count: 1
                }
            }
      ])

      if (like.length > 0) {
        return res.status(200).json(new ApiResponse(200, like[0], "Video like fetched successfully"));
    } else {
        return res.status(200).json(new ApiResponse(200, { videoId, count: 0 }, "Video like fetched successfully"));
    }
  
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, fetchVideoLikes };
