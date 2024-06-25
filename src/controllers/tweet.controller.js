import mongoose from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Tweet content can't be empty");
  }

  const tweet = await Tweet.create({
    owner: _id,
    content,
  });

  if (!tweet) {
    new ApiError(500, "Internal server error ,unable to create tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Successfully tweet created"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Tweet content can't be empty");
  }
  
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content },
    },
    {
      new: true,
    }
  );

  if (!tweet) {
    new ApiError(500, "Internal server error ,unable to update tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Successfully tweet updated"));
});

const removeTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found, unable to delete");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully tweet deleted"));
});

const getUserTweet = asyncHandler(async (req, res) => {
  console.log(req.params.userId);
  const tweet = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.params.userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!tweet) {
    throw new ApiError(404, tweet, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Successfully tweet fetch by userId"));
});

export { createTweet, updateTweet, removeTweet, getUserTweet };
