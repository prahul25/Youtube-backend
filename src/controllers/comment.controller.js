import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addCommentToVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const { _id } = req.user;

  if(!content){
    throw new ApiError(400 , "Comment is required")
  }

  const comment = await Comment.create({
    content,
    owner: _id,
    video: videoId,
  });

if(!comment){
    throw new ApiError(500 , "Internal server error, Unable to Add comment on video")
}
  return res
    .status(200)
    .json(new ApiResponse(200,comment, "Comment added successfully to the video"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // Your logic to get comments goes here

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Comments retrieved successfully for the video")
    );
});

const updateVideoComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  // Your logic to update a comment goes here
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully for the video"));
});

const deleteVideoComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  // Your logic to delete a comment goes here
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully from the video"));
});

export {
  addCommentToVideo,
  getVideoComments,
  updateVideoComment,
  deleteVideoComment,
};
