import { User } from "../models/user.models.js";
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
  });

  req.user.videoUpload.push(video._id);

  await req.user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Successfully video uploaded"));
});

// get all the video of all user to populate all the video like the youtube landing page

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortType /*userId*/ } = req.query;

  let sortField;
  if (sortType === "recent") {
    sortField = "createdAt";
  } else if (sortType === "views") {
    sortField = "views";
  } else if (sortType === "duration") {
    sortField = "duration";
  } else {
    sortField = "createdAt"; // Default sorting field if sortType is not recognized
  }

  const allVideos = await Video.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: {
        path: "$owner",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        __v: 0,
        updatedAt: 0,
        "owner.password": 0,
        "owner.videoUpload": 0,
        "owner.createdAt": 0,
        "owner.updatedAt": 0,
        "owner.email": 0,
        "owner.coverImage": 0,
        "owner.watchHistory": 0,
        "owner.refreshToken": 0,
        "owner.__v": 0,
      },
    },
    {
      $sort: {
        [sortField]: -1, // Sort in descending order by the selected field
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);
  if (!allVideos) {
    throw new ApiError(400, "Something went wrong at backend");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "All videos fetched successfully"));
});

// get the video by video id
const videoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const videoOwner = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: {
        path: "$owner",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        __v: 0,
        updatedAt: 0,
        "owner.password": 0,
        "owner.videoUpload": 0,
        "owner.createdAt": 0,
        "owner.updatedAt": 0,
        "owner.email": 0,
        "owner.coverImage": 0,
        "owner.watchHistory": 0,
        "owner.refreshToken": 0,
        "owner.__v": 0,
      },
    },
  ]);

  if (!videoOwner.length) {
    throw new ApiError(
      404,
      "Video not found, Make sure to give correct video id"
    );
  }

  const updateResult = await Video.updateOne(
    { _id: new mongoose.Types.ObjectId(videoId) },
    { $addToSet: { userWatched: req.user._id } } // $addToSet prevents duplicates
  );

  const updatedVideo = await Video.findById(videoId).populate(
    "owner",
    "-password -videoUpload -createdAt -updatedAt -email -coverImage -watchHistory -refreshToken -__v"
  );

  // Return the updated video with necessary fields
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "Successfully video fetched by video Id"
      )
    );
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { title, thumbnail, description } = req.body;
  const { videoId } = req.params;
  const userId = req.user._id;

  const video = await Video.findById(videoId);

  if (!video.owner.equals(userId)) {
    throw new ApiError(400, "User Unautorized to update video details, Only owner of video update video details");
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        thumbnail,
        description,
      },
    },
    {
      new: true,
    }
  );
  
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video details updated successfully"));
});
export { uploadVideoAndInfo, getAllVideos, videoById, updateVideoDetails };
