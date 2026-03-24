import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    console.log('Key ID:', process.env.RAZORPAY_KEY_ID);
    console.log('Key Secret:', process.env.RAZORPAY_KEY_SECRET ? 'PRESENT' : 'MISSING');
    
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    try {
        console.log('Fetching plans from Razorpay...');
        const plans = await razorpay.plans.all();
        console.log('✅ Success! Found plans:', plans.count);
        process.exit(0);
    } catch (error) {
        console.error('❌ Razorpay Test Failed:', error);
        process.exit(1);
    }
};

test();
