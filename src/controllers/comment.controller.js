import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addCommentToVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const { _id } = req.user;

  if (!content) {
    throw new ApiError(400, "Comment is required");
  }

  const comment = await Comment.create({
    content,
    owner: _id,
    video: videoId,
  });

  if (!comment) {
    throw new ApiError(
      500,
      "Internal server error, Unable to Add comment on video"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, comment, "Comment added successfully to the video")
    );
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const {page = 1, limit = 10} = req.query
  const comment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
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
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },

    {
      $unwind: "$owner",
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        comment,
        "Comments retrieved successfully for the video"
      )
    );
});

const updateVideoComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { newComment } = req.body;

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: newComment,
      },
    },
    { new: true }
  );
  if (!comment) {
    throw new ApiError(
      500,
      "Internal server error, Unable to Add comment on video"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        comment,
        "Comment updated successfully for the video"
      )
    );
});

const deleteVideoComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findByIdAndDelete(commentId, { new: true });

  if (!comment) {
    throw new ApiError(404, "Comment not found, unable to delete");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Comment deleted successfully from the video")
    );
});

export {
  addCommentToVideo,
  getVideoComments,
  updateVideoComment,
  deleteVideoComment,
};
