const User = require('../Models/User');
const Salon = require('../Models/Salon');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Try to find in User collection (SuperAdmin, Staff, etc.)
        let user = await User.findOne({ email });
        let role = user ? user.role : null;
        let userData = user;

        // 2. If not found, try to find in Salon collection (Salon Owners)
        if (!user) {
            const salon = await Salon.findOne({ email });
            if (salon) {
                userData = salon;
                role = 'admin'; // Salons are treated as admins
            }
        }

        if (!userData) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isMatch = await userData.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: userData._id, role: role, salonId: userData.salonId || (role === 'admin' ? userData._id : null) },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            data: {
                accessToken: token,
                user: {
                    id: userData._id,
                    name: userData.name || userData.ownerName,
                    email: userData.email,
                    role: role,
                    salonId: userData.salonId || (role === 'admin' ? userData._id : null)
                }
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};
