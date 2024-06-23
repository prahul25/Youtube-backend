import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

const removingCloudinaryFile = async (filePath) =>{
    try {
        if(!filePath) return null
        
        const response = await cloudinary.uploader.destroy(filePath)
        console.log(response, "deleted successfully")
        return response
    } catch (error) {
        return null
    }
}

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

export {removingCloudinaryFile}