const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const cmsSchema = new mongoose.Schema({
    tenantId: mongoose.Schema.Types.ObjectId,
    section: String,
    content: mongoose.Schema.Types.Mixed
});
const Cms = mongoose.model('Cms', cmsSchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const banners = await Cms.find({ section: 'banners' });
    console.log('Found banners docs:', banners.length);
    banners.forEach(b => {
        console.log('Tenant:', b.tenantId);
        console.log('Content length:', b.content ? b.content.length : 0);
        console.log('Content sample:', JSON.stringify(b.content ? b.content[0] : {}, null, 2));
    });
    process.exit(0);
}
check();
