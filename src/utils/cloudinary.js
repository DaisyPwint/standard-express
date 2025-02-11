import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

cloudinary.config({
    cloud_name: 'db4thmijt',
    api_key: '983397743695774',
    api_secret: process.env.CLOUDINY_SECRET_KEY 
});

export const uploadFileToCloudinary = async (filePath) => {
    try {
        if (!filePath) return null
        const response = await cloudinary.uploader
            .upload(
                filePath, {
                resource_type: 'auto'
            }
            )
        fs.unlinkSync(filePath)
        return response.url;
    } catch (error) {
        fs.unlinkSync(filePath)
        return null
    }
} 