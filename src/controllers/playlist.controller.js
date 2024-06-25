import mongoose from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { videoId } = req.params;
  const { name, description } = req.body;

  if ([name, description].some((field) => field?.trim() === "")) {
    throw new ApiError(
      400,
      "Name and description of the playlist are required"
    );
  }

  const existingPlaylist = await Playlist.findOne({ name });
  if (existingPlaylist) {
    throw new ApiError(
      400,
      "Playlist with this name already exists. Please provide a different name."
    );
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: _id,
    videos: videoId,
  });

  if (!playlist) {
    throw new ApiError(500, "Internal server error, unable to create playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Successfully playlist updated"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: { name, description },
    },
    {
      new: true,
    }
  );

  if (!playlist) {
    throw new ApiError(500, "Internal server error, unable to update playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Successfully playlist created"));
});

const removePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findByIdAndDelete(playlistId, { new: true });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found, unable to delete");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully playlist deleted"));
});

const getPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(playlistId) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
            
            {
                $project:{

                    __v:0,
                    updatedAt:0,
                    userWatched:0,
                }
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
                  },
                },
              ],
            },
          },
          {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
          }
        ],
      },
    },
  ]);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Successfully playlist found"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId , videoId} = req.params;

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404 , "Playlist not found")
    }

    if(playlist.videos.includes(videoId)){
        throw new ApiError(400 , "Video already exists in playlist") // checking whether incoming vidoe is already added or not
    }
    playlist.videos.push(videoId)
    await playlist.save()
    
    
  return res
    .status(200)
    .json(new ApiResponse(200, playlist,"Successfully video added to playlist"));
});

const removeVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId , videoId} = req.params;

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404 , "Playlist not found")
    }

    const indexOfExistedVideo = playlist.videos.indexOf(videoId)

    if(indexOfExistedVideo === -1){
        throw new ApiError(400 , "Video not exists in playlist") // checking whether incoming vidoe is already added or not
    }
    playlist.videos.splice(indexOfExistedVideo , 1)
    await playlist.save()
  return res
    .status(200)
    .json(new ApiResponse(200, playlist,"Successfully video removed from playlist"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    const playlist = await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }

        },
        {
            $addFields:{
                videoCount:{
                    $size:"$videos"
                }
            }
        }
    ])

    if(!playlist){
        throw new ApiError(404 , "Playlist not found")
    }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist,"Successfully playlist fetched from userId"));
});

export {
  createPlaylist,
  updatePlaylist,
  removePlaylist,
  getPlaylist,
  addVideoToPlaylist,
  removeVideoToPlaylist,
  getUserPlaylists,
};
