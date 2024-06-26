import mongoose from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getSubscribedToChannel = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    
    const subscribe = await Subscription.aggregate([
    {
        $match:{
            subscriber:new mongoose.Types.ObjectId(channelId)
        },
    },
    {
        
        $group:{
            _id:"$subscriber", // here we will find our user id with other field subscriber so that we can get
            count:{

                $sum:1
            }
            
        }
    }

])
if(!subscribe || !subscribe.length){
    return res
.status(200)
.json(
  new ApiResponse(
    200,{channelId , count:0},
    "No subscriptions found for this channel"
  )
);
}
return res
.status(200)
.json(
  new ApiResponse(
    200,subscribe,
    "Successfully fetched subscriber count whom channel subscribed by user"
)
);
});

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const {_id} = req.user
    const existedSubscriber = await Subscription.findOne({subscriber:_id , channel:channelId})

    if(existedSubscriber){
        const subscriber = await Subscription.findByIdAndDelete(existedSubscriber)
        
        
        return res
          .status(200)
          .json(
              new ApiResponse(
                  200,subscriber,
                  "Successfully Unsubscribed channel"
                )
            );
        }else{
            
        const subscriber = await Subscription.create({
            subscriber:_id,channel:channelId
        })
        
        
        return res
          .status(201)
          .json(
              new ApiResponse(
              201,subscriber,
              "Successfully subscribed channel"
            )
          );
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
        const {subscriberId} = req.params;
    
        const subscribe = await Subscription.aggregate([
            {
                $match:{
                    channel:new mongoose.Types.ObjectId(subscriberId)
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

        ])
    
        if(!subscribe || !subscribe.length){
            return res
        .status(200)
        .json(
          new ApiResponse(
            200,{subscriberId , count:0},
            "No subscribers found for this channel"
          )
        );
        }
        
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,subscribe,
            "Successfully fetched subscribed channel count whom subscribed by channel"
          )
        );
});

export {
  getSubscribedToChannel,
  toggleSubscription,
  getUserChannelSubscribers,
};
