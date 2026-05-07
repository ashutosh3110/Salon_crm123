const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const Customer = require('../Models/Customer');
const Salon = require('../Models/Salon');

/**
 * Add loyalty points to a customer based on salon configuration
 * @param {string} customerId - ID of the customer
 * @param {string} salonId - ID of the salon
 * @param {string} type - Type of award (BIRTHDAY, ANNIVERSARY, BOOKING, etc.)
 * @param {string} description - Custom description for the transaction
 */
exports.addLoyaltyPoints = async (customerId, salonId, type, description) => {
    try {
        const salon = await Salon.findById(salonId);
        if (!salon || !salon.loyaltySetting || !salon.loyaltySetting.active) {
            return { success: false, message: 'Loyalty system not active for this salon' };
        }

        let points = 0;
        const config = salon.loyaltySetting;

        switch (type) {
            case 'BIRTHDAY':
                points = config.birthdayPoints || 50;
                break;
            case 'ANNIVERSARY':
                points = config.anniversaryPoints || 100;
                break;
            case 'BOOKING':
                // Assuming a fixed point for booking if not specified, 
                // but usually it's based on amount. Here we use it for a fixed "booking award"
                points = 10; 
                break;
            default:
                points = 0;
        }

        if (points <= 0) return { success: false, message: 'Zero points configured for this type' };

        // 1. Create Loyalty Transaction
        await LoyaltyTransaction.create({
            customerId,
            salonId,
            type: 'CREDIT',
            amount: points,
            description: description || `${type} Award`,
            source: type
        });

        // 2. Update Customer total points
        await Customer.findByIdAndUpdate(customerId, {
            $inc: { loyaltyPoints: points }
        });

        return { success: true, points };
    } catch (err) {
        console.error('Error adding loyalty points:', err);
        return { success: false, message: err.message };
    }
};
