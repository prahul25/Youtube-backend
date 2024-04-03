import {v2 as  cloudinary} from 'cloudinary';
import fs from "fs";


const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath ,{
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath);
        // file has been uploaded successfully
        // console.log("File is uploaded sucessfully" , response)
        return response; // try to console.log(response.url) and see what's inside of it
    } catch (error) {
        fs.unlinkSync(localFilePath);// delete local saved temporary file as the upload operation got failed
        return null
    }
}

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export {uploadOnCloudinary};