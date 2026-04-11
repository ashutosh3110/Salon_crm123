const mongoose = require('mongoose');
const uri = 'mongodb+srv://mohammadrehan00121_db_user:xqFnRRwX607Kkxd4@cluster0.rnxrxmk.mongodb.net/Saloon';

async function run() {
    try {
        await mongoose.connect(uri);
        const Salon = mongoose.model('Salon', new mongoose.Schema({ name: String }));
        const salon = await Salon.findOne();
        
        if (!salon) {
            console.log('No salon found');
            process.exit(0);
        }

        const Product = mongoose.model('Product', new mongoose.Schema({ 
            salonId: mongoose.Schema.Types.ObjectId, 
            name: String,
            categoryId: mongoose.Schema.Types.ObjectId,
            outletIds: [mongoose.Schema.Types.ObjectId],
            stockByOutlet: Map
        }));
        
        const ProductCategory = mongoose.model('ProductCategory', new mongoose.Schema({ 
            salonId: mongoose.Schema.Types.ObjectId, 
            name: String 
        }));

        const Outlet = mongoose.model('Outlet', new mongoose.Schema({ 
            salonId: mongoose.Schema.Types.ObjectId, 
            name: String 
        }));

        const outlet = await Outlet.findOne({ salonId: salon._id });
        
        // Update Categories
        const catRes = await ProductCategory.updateMany(
            { name: { $in: ['Hair Care', 'Skin Care', 'Styling', 'Fragrance'] } },
            { salonId: salon._id }
        );
        console.log(`Updated ${catRes.modifiedCount} categories to salon ${salon._id}`);

        // Update Products
        const prodRes = await Product.updateMany(
            { name: { $regex: 'Wapixo|DermaGlow|BarberX|Essence|Shampoo|Serum|Clay|Cologne|EDP|Mask|Conditioner', $options: 'i' } },
            { 
                salonId: salon._id,
                outletIds: outlet ? [outlet._id] : [],
                stockByOutlet: outlet ? new Map([[outlet._id.toString(), 50]]) : new Map()
            }
        );
        console.log(`Updated ${prodRes.modifiedCount} products to salon ${salon._id}`);
        if(outlet) console.log(`Assigned products to outlet ${outlet._id} (${outlet.name})`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
