const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const cmsSchema = new mongoose.Schema({
    section: String,
    content: mongoose.Schema.Types.Mixed
});
const Cms = mongoose.model('Cms', cmsSchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const docs = await Cms.find({ section: 'banners' });
    docs.forEach(doc => {
        (doc.content || []).forEach(b => {
            console.log('Banner Image:', b.image);
        });
    });
    process.exit(0);
}
check();
