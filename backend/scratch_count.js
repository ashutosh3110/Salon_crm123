const mongoose = require('mongoose');
const mongoURI = 'mongodb://mohammadrehan00121_db_user:4QlKqb1h5rM05lSZ@ac-al5duhf-shard-00-00.rnxrxmk.mongodb.net:27017,ac-al5duhf-shard-00-01.rnxrxmk.mongodb.net:27017,ac-al5duhf-shard-00-02.rnxrxmk.mongodb.net:27017/Saloon_Test?ssl=true&replicaSet=atlas-xosmfq-shard-0&authSource=admin&appName=Cluster0';

async function run() {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB!");

    const Salon = mongoose.model('Salon', new mongoose.Schema({}, { strict: false }));
    const Outlet = mongoose.model('Outlet', new mongoose.Schema({}, { strict: false }));

    const salons = await Salon.find();
    console.log(`Found ${salons.length} salons in total:`);
    
    for (const s of salons) {
        const count = await Outlet.countDocuments({ salonId: s._id });
        console.log(`ID: ${s._id} | Name: ${s.name} | Email: ${s.email} | Status: ${s.status} | Outlets Count: ${count}`);
    }

    await mongoose.disconnect();
}

run().catch(console.error);
