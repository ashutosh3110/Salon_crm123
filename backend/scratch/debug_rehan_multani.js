const mongoose = require('mongoose');
const path = require('path');
const Outlet = require('../Models/Outlet');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const salonId = '69fdc9e21a21bf41d0747f8e';
        const matchStage = { 
            isActive: true, 
            salonId: new mongoose.Types.ObjectId(salonId) 
        };

        const outlets = await Outlet.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'staffs',
                    localField: '_id',
                    foreignField: 'outletId',
                    as: 'staff'
                }
            },
            {
                $addFields: {
                    staffCount: { 
                        $size: {
                            $filter: {
                                input: "$staff",
                                as: "s",
                                cond: { $ne: ["$$s.role", "customer"] }
                            }
                        }
                    }
                }
            },
            { $project: { staff: 0 } }
        ]);

        console.log('Aggregation returned outlets:');
        console.log(JSON.stringify(outlets.map(o => ({ name: o.name, id: o._id, staffCount: o.staffCount })), null, 2));

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
}

run();
