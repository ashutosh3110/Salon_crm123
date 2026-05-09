import api from '../services/api';

const DEFAULT_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222222%22%2F%3E%3Cpath%20d%3D%22M200%20150%20L250%20220%20L150%20220%20Z%22%20fill%3D%22%23444444%22%2F%3E%3Ccircle%20cx%3D%22160%22%20cy%3D%22150%22%20r%3D%2215%22%20fill%3D%22%23444444%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22260%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EWapixo%3C%2Ftext%3E%3C%2Fsvg%3E";

/**
 * Robust utility to get the absolute URL for any image path stored in the database.
 * Handles:
 * 1. Absolute URLs (including localhost fixing for remote access)
 * 2. Relative paths (prepending backend base URL)
 * 3. Base64/Blob URLs
 * 4. Production URL fixes (wapixo.com -> api.wapixo.com)
 */
export const getImageUrl = (p) => {
    if (!p) return DEFAULT_IMAGE;
    if (typeof p !== 'string' || !p.trim()) return DEFAULT_IMAGE;
    
    let path = p.trim().replace(/\\/g, '/');

    // Get the base API URL without the '/api' suffix if present
    const apiBase = (api.defaults.baseURL || '').replace(/\/api$/, '');
    
    // Handle Absolute URLs
    if (path.startsWith('http')) {
        // Fix for local development when accessing via IP/different host
        // If the stored URL contains localhost:5000 but we are accessing via another host,
        // we should swap it with our current API base.
        if (path.includes('localhost:5000') && apiBase && !apiBase.includes('localhost:5000')) {
            path = path.replace(/https?:\/\/localhost:5000/i, apiBase);
        }
        
        // Fix for wapixo production deployment
        if (path.includes('wapixo.com/uploads') && !path.includes('api.wapixo.com/uploads')) {
            path = path.replace('wapixo.com/uploads', 'api.wapixo.com/uploads');
        }
        
        return path;
    }

    // Handle Data/Blob URLs
    if (path.startsWith('data:') || path.startsWith('blob:')) return path;

    // Handle Relative Paths
    // Ensure we don't have double slashes
    const separator = path.startsWith('/') ? '' : '/';
    return `${apiBase}${separator}${path}`;
};

/**
 * Converts an image file to WebP format on the frontend.
 * Useful for reducing upload size and improving mobile performance.
 */
export const convertToWebP = (file, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                            type: 'image/webp',
                            lastModified: Date.now()
                        });
                        resolve(webpFile);
                    } else {
                        reject(new Error("Canvas toBlob failed"));
                    }
                }, 'image/webp', quality);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export default getImageUrl;
