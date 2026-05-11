const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesToConvert = [
    {
        src: 'C:/Users/admin/.gemini/antigravity/brain/d775dd55-1fee-4411-8690-5b9d7c631926/salon_banner_luxury_1778504226647.png',
        dest: 'uploads/general/banner_1.webp'
    },
    {
        src: 'C:/Users/admin/.gemini/antigravity/brain/d775dd55-1fee-4411-8690-5b9d7c631926/salon_service_haircut_1778504249412.png',
        dest: 'uploads/services/service_1.webp'
    },
    {
        src: 'C:/Users/admin/.gemini/antigravity/brain/d775dd55-1fee-4411-8690-5b9d7c631926/salon_product_shampoo_1778504268163.png',
        dest: 'uploads/general/product_1.webp'
    },
    {
        src: 'C:/Users/admin/.gemini/antigravity/brain/d775dd55-1fee-4411-8690-5b9d7c631926/salon_outlet_interior_1778504284758.png',
        dest: 'uploads/outlets/outlet_1.webp'
    }
];

const convert = async () => {
    for (const img of imagesToConvert) {
        try {
            await sharp(img.src)
                .webp({ quality: 80 })
                .toFile(img.dest);
            console.log(`Converted and saved: ${img.dest}`);
        } catch (err) {
            console.error(`Error converting ${img.src}:`, err);
        }
    }
};

convert();
