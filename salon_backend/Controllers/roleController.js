const Role = require('../Models/Role');

// @desc    Get all roles for a salon
// @route   GET /api/roles
// @access  Private
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find({ salonId: req.user.salonId });
        res.json({ success: true, count: roles.length, data: roles });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Private (Admin)
exports.createRole = async (req, res) => {
    try {
        req.body.salonId = req.user.salonId;
        const role = await Role.create(req.body);
        res.status(201).json({ success: true, data: role });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Role already exists' });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (Admin)
exports.updateRole = async (req, res) => {
    try {
        let role = await Role.findOne({ _id: req.params.id, salonId: req.user.salonId });
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        role = await Role.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: role });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin)
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, salonId: req.user.salonId });
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
        
        if (role.isDefault) {
            return res.status(400).json({ success: false, message: 'Default roles cannot be deleted' });
        }

        await role.deleteOne();
        res.json({ success: true, message: 'Role deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
