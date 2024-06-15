import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req , res , next) =>{
    // here is developer is not passing the tokens through cookies so atleast through the header we can access or will got the token
    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // const token =  req.headers.authorization?.replace("Bearer " , "") || req.cookies?.accessToken // change code 
        
        // console.log(token , "token")
        if(!token){
            throw new ApiError(401 , "Unauthorized request")
        }
        
        // here is we have to check the token is valid or not
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken") // this id reference from user model access token
        // console.log(user , "Decodeduser")
    
        if(!user) {
            // TODO: 
            throw new ApiError(401 , "Invalid access token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid access token")
    }
})