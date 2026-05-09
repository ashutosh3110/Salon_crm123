const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const outletSchema = new mongoose.Schema({
    name: String,
    isActive: Boolean
});
const Outlet = mongoose.model('Outlet', outletSchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const outlets = await Outlet.find({ isActive: true });
    outlets.forEach(o => {
        console.log('Outlet:', o.name, 'ID:', o._id);
    });
    process.exit(0);
}
check();
