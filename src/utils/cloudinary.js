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
        // we are deleting because its file is already on localStorage which fails to upload which leads to error
        fs.unlinkSync(localFilePath);// delete local saved temporary file as the upload operation got failed
        return null
    }
}



export {uploadOnCloudinary};