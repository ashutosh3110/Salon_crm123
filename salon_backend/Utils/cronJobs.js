const cron = require('node-cron');
const Salon = require('../Models/Salon');
const User = require('../Models/User');

const initCronJobs = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily subscription expiration check...');
        try {
            const today = new Date();
            
            // Find salons whose subscription have expired
            const expiredSalons = await Salon.find({
                subscriptionExpiry: { $lt: today },
                status: { $in: ['active', 'trial'] }
            });

            console.log(`Found ${expiredSalons.length} expired salons.`);

            for (const salon of expiredSalons) {
                salon.status = 'expired';
                salon.isActive = false;
                await salon.save();

                // Also deactivate the admin user
                await User.findOneAndUpdate({ email: salon.email }, { isActive: false });
                
                console.log(`Salon ${salon.name} (${salon._id}) has been expired.`);
            }
        } catch (err) {
            console.error('Error in subscription expiration cron job:', err);
        }
    });

    console.log('Subscription Expiration Cron Job Initialized (Daily at 00:00)');
};

module.exports = initCronJobs;
