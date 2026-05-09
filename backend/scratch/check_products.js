const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const productSchema = new mongoose.Schema({
    name: String,
    image: String,
    images: [String]
});
const Product = mongoose.model('Product', productSchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await Product.find({}).limit(10);
    products.forEach(p => {
        console.log('Product:', p.name);
        console.log('  Image:', p.image);
        console.log('  Images:', p.images);
    });
    process.exit(0);
}
check();
