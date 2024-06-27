import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";

const getUserDashboard = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    // Aggregation pipeline to get the total video count, views count, likes count, and comment count
    const stats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(_id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "videoComments"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"owner",
                foreignField:"channel",
                as:"subscriber"
            }
        },
        {
            $group: {
                _id: "$owner",
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$videoLikes" } },
                totalComments: { $sum: { $size: "$videoComments" } },
                totalSubscribers: { $sum: "$channel" }
            }
        }
    ]);

    const subscriberStats = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(_id)
            },
        },
        {
    
            $group:{
                _id:"$channel", // here we will find subscriber
                count:{
    
                    $sum:1
                }
                
            }
        }

    ]);

    stats[0].totalSubscribers = subscriberStats[0].count
    if (!stats.length && !subscriberStats.length) {
        return res.status(200).json(new ApiResponse(200, {
            totalVideos: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalSubscribers:0
        }, "Successfully fetched user stats"));
    }
    
    
    return res.status(200).json(new ApiResponse(200, stats[0], "Successfully fetched user stats"));
});

const getUserUploadedVideos = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "videos", // here we have to find for Video model but in database all model are lowercased and it plural
          localField: "videoUpload",
          foreignField: "_id",
          as: "videoUploaded",
          pipeline: [
            {
              $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: 1,
                userWatched: 1,
              },
            },
          ],
        },
      },
    ]);

  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user[0].videoUploaded,
          "Uploaded history fetched successfully"
        )
      );
  });

export {getUserDashboard,getUserUploadedVideos}