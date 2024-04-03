import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
// import {User}

const registerUser = asyncHandler(async (req, res) => {
  // step 1 : get the user detail from frontend
  // step 2 : try validation if user not comes with empty data
  // step 3 : check if user already exists in our database with same username or email id
  // step 4 : check images, for avatar
  // step 5 : upload them to cloudinary , avatar
  // step 6 : create user object - create entry in db
  // step 7 : remove password and refresh token field from response
  // step 8 : check for user creation
  // step 9 : return response

  const { username, email, fullName, password } = req.body;

  if([fullName,email,username,password].some((field) => field?.trim() === "")){
    throw new ApiError(400,"All field are required!");
  }

  const existedUser = await User.findOne({
    $or:[{username} , {email}]
  })

  if(existedUser){
    throw new ApiError(409,"User with email or username already exsits")
  }
  
  const avatarLocalPath = req.files?.avatar[0].path // in this case we have more than file with same name with the help of [0] it takes first file
  let coverImageLocalPath;

  if(req.files && Array.isArray( req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path // because in that we array of object so that's why we choose [0]
  } // because in that we array of object so that's why we choose [0] > 0

 
  if(!avatarLocalPath){
    throw new ApiError(400,'Please provide a profile image')
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400 , "Avatar file is required")
  }

  const user = await User.create({
    username:username.toLowerCase(),
    fullName,
    email,
    password,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if(!createdUser){
    throw new ApiError(500 , "Something went wrong while registring the user!")
  }

  return res.status(201).json(
    new ApiResponse(200 , createdUser , "User registered successfully")
  )
});


export { registerUser };
