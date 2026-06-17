const mongoose = require('mongoose');
const Consultation = require('../Models/Consultation');
const Customer = require('../Models/Customer');

// @desc    Create new consultation record
// @route   POST /consultations
// @access  Private (Admin/Manager/Stylist)
exports.createConsultation = async (req, res) => {
    try {
        const { customerId, outletId, title, notes, solution, adminNotes, status, followUpDate, attachment } = req.body;
        const salonId = req.user.salonId;

        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon context missing' });
        }

        if (!customerId || !outletId || !title || !notes || !solution) {
            return res.status(400).json({ success: false, message: 'Required fields are missing: customerId, outletId, title, notes, solution' });
        }

        // Validate customer existence
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const consultation = await Consultation.create({
            customerId,
            salonId,
            outletId,
            title,
            notes,
            solution,
            adminNotes,
            status: status || 'pending',
            followUpDate: followUpDate || null,
            attachment: attachment || ''
        });

        const populated = await Consultation.findById(consultation._id)
            .populate('customerId', 'name phone email')
            .populate('outletId', 'name city');

        res.status(201).json({
            success: true,
            data: populated
        });
    } catch (err) {
        console.error('Create consultation error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};

// @desc    Get consultations (Admin/Manager/Stylist view with filter/pagination)
// @route   GET /consultations
// @access  Private
exports.getConsultations = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon context missing' });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const filter = { salonId };

        if (req.query.outletId) {
            filter.outletId = req.query.outletId;
        }

        if (req.query.customerId) {
            filter.customerId = req.query.customerId;
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const totalCount = await Consultation.countDocuments(filter);
        const consultations = await Consultation.find(filter)
            .populate('customerId', 'name phone email')
            .populate('outletId', 'name city')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: consultations
        });
    } catch (err) {
        console.error('Get consultations error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get consultation details
// @route   GET /consultations/:id
// @access  Private
exports.getConsultationDetails = async (req, res) => {
    try {
        const consultation = await Consultation.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        })
        .populate('customerId', 'name phone email')
        .populate('outletId', 'name city');

        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Consultation record not found' });
        }

        res.json({
            success: true,
            data: consultation
        });
    } catch (err) {
        console.error('Get consultation details error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update consultation details
// @route   PATCH /consultations/:id
// @access  Private (Admin/Manager/Stylist)
exports.updateConsultation = async (req, res) => {
    try {
        let consultation = await Consultation.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Consultation record not found' });
        }

        // Restrict Stylist / Receptionist from editing completed records optionally
        // Allow updates
        const allowedFields = ['title', 'notes', 'solution', 'adminNotes', 'status', 'followUpDate', 'attachment'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                consultation[field] = req.body[field];
            }
        });

        await consultation.save();

        const populated = await Consultation.findById(consultation._id)
            .populate('customerId', 'name phone email')
            .populate('outletId', 'name city');

        res.json({
            success: true,
            message: 'Consultation record updated successfully',
            data: populated
        });
    } catch (err) {
        console.error('Update consultation error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};

// @desc    Delete consultation
// @route   DELETE /consultations/:id
// @access  Private (Admin/Manager only)
exports.deleteConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findOne({
            _id: req.params.id,
            salonId: req.user.salonId
        });

        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Consultation record not found' });
        }

        await Consultation.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Consultation record permanently deleted'
        });
    } catch (err) {
        console.error('Delete consultation error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get consultations for customer (Customer application read-only timeline)
// @route   GET /consultations/customer/me
// @access  Private (Customer only)
exports.getCustomerConsultations = async (req, res) => {
    try {
        const customerId = req.user._id; // Logged-in customer context from passport/middleware auth
        
        const consultations = await Consultation.find({ customerId })
            .populate('outletId', 'name city')
            .populate('salonId', 'name logo')
            .sort({ date: -1 });

        res.json({
            success: true,
            count: consultations.length,
            data: consultations
        });
    } catch (err) {
        console.error('Get customer consultations error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
