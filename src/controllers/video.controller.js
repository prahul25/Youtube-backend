import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { removingCloudinaryFile } from "../utils/removingCloudinaryFile.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// first we get the user details like user itself than after his video , thumbnail , title , description
// thanafter we upload the video file like we upload avatar and cover image and added to the user data so that when
// someone hits to get user details to know he got how many video get uploaded and we can add other to remove that from from user
// too and cloudinary server too
// also we can add that if we any specific url so that will get all the video of all user like youtube
// also add on we can add likes and dislike like the comments
// after that if i want to checked user history so i have to first create the video url and when ever any one hit that url it will get the count also i will that user stored in the video userWatched
const uploadVideoAndInfo = asyncHandler(async (req, res) => {
  const { thumbnail, title, description } = req.body;

  if ([thumbnail, title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All field are required!");
  }

  const videoLocalPath = req.file?.path;

  if (!videoLocalPath.length) {
    throw new ApiError(400, "Video file is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);

  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }

  const video = await Video.create({
    title,
    thumbnail,
    description,
    videoFile: videoFile.url,
    duration: videoFile.duration,
    owner: req.user._id, // here we storing only the owner of video who just upload the so that if i got to the profile of the user than if i want to check how many video i have uploaded i will as that point
    // userWatched:
    // views
  });

  const videoUploadAggregationPipeline = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(video._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "videoUpload",
        as: "videoFiles",
      },
    },
    {
      $project: {
        _id: 1, // if you put id = 0 you can't able to push this user
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        createdAt: 1,
      },
    },
  ]);

  req.user.videoUpload.push(videoUploadAggregationPipeline[0]);
  await req.user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Successfully video uploaded"));
});

//Get all the video of all user to populate all the video like the youtube landing page

export { uploadVideoAndInfo};
