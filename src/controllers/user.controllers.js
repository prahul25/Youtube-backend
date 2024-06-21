import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { removingCloudinaryFile } from "../utils/removingCloudinaryFile.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { publicId } from "../utils/getPublicIdFromUrl.js";
import mongoose from "mongoose";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // throuh below line we are adding our refersh token in user
    // console.log(refreshToken , "Before")
    user.refreshToken = await refreshToken;
    // console.log(refreshToken , "After")
    // through below line we are saving only refersh token if we directly do save it leads it wants password
    await user.save({ validateBeforeSave: false }); // To bypass the token validation in order to update the refreshToken
    // console.log(user)
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

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

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required!");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exsits");
  }

  // req.files because we implement the middleware which throught we got req.files through that we get directly excess the file
  // we got this from multer
  // try to console.log the req.files to know more about
  const avatarLocalPath = req.files?.avatar[0].path; // in this case we have more than file with same name with the help of [0] it takes first file
  // console.log(req.files.avatar[0].path , "consoling log req.files")
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path; // because in that we array of object so that's why we choose [0]
  } // because in that we array of object so that's why we choose [0] > 0

  if (!avatarLocalPath) {
    throw new ApiError(400, "Please provide a profile image");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registring the user!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // Step 1 : take the email id or username and password from user
  // Step 2 : check username or email id and passwrod with our mongodb
  // Step 3 : if email id or username and password are correct give refresh token
  //        : else only email id is there but provided passwrod is not correct give error message
  //        : if both username or email id is not present in mongodb show error message that user must be registered
  // Step 4 : if all are correct give refresh as well as  access tokens
  // Step 5 : Send cookies

  const { username, email, password } = req.body;
  // const existedUserName = await User.findOne({ username: username });
  // console.log(existedUserName , "trying to console");
  if (!(username || email)) {
    throw new ApiError(400, "Username or Email field is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  
  
  if (!user) {
    throw new ApiError(404, "User does not Exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password");
  }

  let { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );
  refreshToken = await refreshToken;
  accessToken = await accessToken;

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    // modified through only server not by frontend
    httpOnly: true,
    secure: true,
  };
  // console.log(accessToken , "printing out the both access and referesh token")
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          // this is because may developer want to save store refresh token in local storage may developing mobile application because in that cookies are not set
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Step 1 : Just clear the tokens and also the cookies in which we sending user details
  const logoutUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // unset operator remove whole refresh token field
      },
    },
    {
      new: true, // this will make sure return the response the new updated value
    }
  );

  
  const options = {
    // modified through only server not by frontend
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized access");
    }
    // console.log(incomingRefreshToken, "consoling the decoded token")
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    // console.log(user , "before generating the token")
    if (incomingRefreshToken !== user.refreshToken) {
      // here we have taken the incomingrefrehs because both tokens are encoded when we add databases and send to the cookies both are encoded
      throw new ApiError(401, "Refresh token expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    let { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    user.refreshToken = await refreshToken; // changes
    accessToken = await accessToken;
    refreshToken = await refreshToken;
    // console.log({accessToken , refreshToken} , "generating the new access and refreshtoken")
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          201,
          { accessToken, refreshToken },
          "New access token created"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid refresh token");
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { username, email, oldPassword, newPassword } = await req.body;
  // console.log({ username, email, oldPassword, newPassword })
  const user =
    (await User.findById(req.user?._id)) ||
    (await User.findOne({ $or: [{ username }, { email }] }));
  // console.log(user)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = await newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getUserDetails = asyncHandler(async (req, res) => {
  // console.log(req.user);
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { newFullName, newEmail, newUserName } = req.body;

  if (!(newFullName || newEmail || newUserName)) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUserName = await User.findOne({ username: newUserName });
  // console.log(existedUserName);
  if (existedUserName) {
    throw new ApiError(
      400,
      "Already username is acquired, try with different username"
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: newFullName, // ES6 syntax
        email: newEmail,
        username: newUserName || existedUserName,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "User/Accounts details updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  // console.log(req.file.path,"uy")
  const oldAvatar = req.user.avatar;
  // console.log(oldAvatar);
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log(avatar , "avatar")
  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  // first get public id from url
  const publicIdFromUrl = publicId(oldAvatar);
  // console.log(req.user , "req user id")
  const deletingOldFileFromCloudinary =
    await removingCloudinaryFile(publicIdFromUrl);

  if (deletingOldFileFromCloudinary.result !== "ok") {
    throw new ApiError(400, "Failed to delete old cloundinary file");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");
  // console.log(user)

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // console.log(req.file)
  const oldCoverImage = req.user.coverImage;
  const coverImagwLocalPath = req.file.path;
  if (!coverImagwLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }

  const coverImage = uploadOnCloudinary(coverImagwLocalPath);

  if (!coverImage) {
    throw new ApiError(400, "Failed to upload cover image");
  }
  // console.log(oldCoverImage)
  const publicIdFromUrl = publicId(oldCoverImage);

  const deletingOldFileFromCloudinary =
    await removingCloudinaryFile(publicIdFromUrl);

  if (deletingOldFileFromCloudinary.result !== "ok") {
    throw new ApiError(400, "Failed to delete old cloundinary file");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions", // here we have to find for Subscription model but in database all model are lowercased and it plural
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions", // here we have to find for Subscription model but in database all model are lowercased and it plural
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers", // here we have to put $ because subscribers is field
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: /*in checks for both object and array*/ [
                req.user?._id,
                "$subscribers.subscriber",
              ],
            }, //total subscriber has there is so we checking by passing the req.user._id is it present or not
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not existed");
  }
  // try by consoling log the channel for better understanding what is returns
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

// const getUploadedVideos = asyncHandler

const getUploadedVideos = asyncHandler(async (req, res) => {
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
        as: "videoUploaded"
      //   pipeline: [
      //     {
      //     $lookup:{
      //       from:"users",
      //       localField:"owner",
      //       foreignField:"_id",
      //       as:"owner",
      //       pipeline:[
      //         {
      //           $project:{
      //             fullName:1,
      //             username:1,
      //             avatar:1
      //           }
      //         }
      //       ]
      //     }
      //   },
      // {
      //   $addFields:{ // modifying the owner 
      //     owner:{
      //       $first:"$owner"
      //     }
      //   }
      // }],
      },
    },
  ]);
// console.log(user[0].videoUploaded , "trying to log console")
  return res.status(200).json(new ApiResponse(200 , user[0].videoUploaded , "Uploaded history fetched successfully"))
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updatePassword,
  getUserDetails,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUploadedVideos
};
