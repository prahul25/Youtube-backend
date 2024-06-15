import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
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
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
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
    user.refreshToken = await refreshToken // changes 
    accessToken = await accessToken;
    refreshToken = await refreshToken;
    // console.log({accessToken , refreshToken} , "generating the new access and refreshtoken")
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(201, { accessToken, refreshToken }, "New access token created")
      );
  } catch (error) {
    throw new ApiError(401 , error.message || "Invalid refresh token")
  }
});
export { registerUser, loginUser, logoutUser , refreshAccessToken};
