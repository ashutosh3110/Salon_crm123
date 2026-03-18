import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';
import logger from './logger.js';

// Configure Cloudinary only if credentials are provided
if (config.cloudinary.cloud_name && config.cloudinary.api_key && config.cloudinary.api_secret && config.cloudinary.cloud_name !== 'your_cloud_name') {
    cloudinary.config({
        cloud_name: config.cloudinary.cloud_name,
        api_key: config.cloudinary.api_key,
        api_secret: config.cloudinary.api_secret,
    });
    logger.info('Cloudinary configured successfully.');
} else {
    logger.warn('Cloudinary credentials missing or using placeholders. Uploads will fail or use mock logic.');
}

/**
 * Upload a file to Cloudinary
 * @param {string} filePath 
 * @param {string} folder 
 * @returns {Promise<Object>}
 */
export const uploadToCloudinary = async (filePath, folder = 'blog_articles') => {
    try {
        if (!config.cloudinary.cloud_name || config.cloudinary.cloud_name === 'your_cloud_name') {
            throw new Error('Cloudinary not configured');
        }

        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'auto',
        });
        return result;
    } catch (error) {
        throw error;
    }
};

export default cloudinary;
