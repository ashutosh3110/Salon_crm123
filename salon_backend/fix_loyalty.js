const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Salon = mongoose.model('Salon', new mongoose.Schema({}, { strict: false }));
        
        const salons = await Salon.find({});
        for (const s of salons) {
            console.log(`Fixing salon: ${s.name}`);
            if (!s.loyaltySetting || !s.loyaltySetting.pointsRate) {
                s.loyaltySetting = {
                    active: true,
                    pointsRate: 10,
                    redeemValue: 1,
                    minRedeemPoints: 100
                };
                await Salon.updateOne({ _id: s._id }, { $set: { loyaltySetting: s.loyaltySetting } });
                console.log(`- Updated loyalty settings for ${s.name}`);
            }
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixData();
