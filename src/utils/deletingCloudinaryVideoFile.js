import {v2 as  cloudinary} from 'cloudinary';
import fs from "fs";

const deleteVideoFromCloudinary = async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      return result;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  };

export {deleteVideoFromCloudinary}