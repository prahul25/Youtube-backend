import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema({
    videoFile:{
        type:String,    // cloudinary url
        required:[true,"Please provide a file"]
    },
    thumbnail:{
        type:String,    // cloudinary url
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,  //connects to user id in users collection
        ref:"User"   //refers to the User model
    },
    videosUploaded:{
        type:Schema.Types.ObjectId,  //connects to user id in users collection
        ref:"User"
    },
    userWatched:[{
        type:Schema.Types.ObjectId,  //connects to user id in users collection
        ref:"User"   //refers to the User model
    }]
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video" , videoSchema)