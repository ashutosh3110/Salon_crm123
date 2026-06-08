const User = require('../Models/User');
const Salon = require('../Models/Salon');
const Staff = require('../Models/Staff');
const Customer = require('../Models/Customer');

/**
 * Checks if an email exists in any of the master collections.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} - Returns true if the email is unique (not found), false otherwise.
 */
exports.checkGlobalEmailUnique = async (email) => {
    if (!email) return true;
    const lowerEmail = email.toLowerCase().trim();

    if (await User.findOne({ email: lowerEmail })) return false;
    if (await Salon.findOne({ email: lowerEmail })) return false;
    if (await Staff.findOne({ email: lowerEmail })) return false;
    if (await Customer.findOne({ email: lowerEmail })) return false;

    return true;
};
