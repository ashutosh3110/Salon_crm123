const Testimonial = require('../Models/Testimonial');

// @desc    Submit a new testimonial
// @route   POST /api/testimonials
// @access  Public
exports.submitTestimonial = async (req, res) => {
    try {
        const { name, role, rating, content } = req.body;
        let image = null;
        if (req.file) {
            image = '/uploads/general/' + req.file.filename;
        }
        const newTestimonial = await Testimonial.create({
            name, role, rating, content, status: 'pending', image
        });
        res.status(201).json({ success: true, data: newTestimonial });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all APPROVED testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getApprovedTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ status: 'approved' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: testimonials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get ALL testimonials (for SuperAdmin)
// @route   GET /api/testimonials/all
// @access  Private/Admin
exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: testimonials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update testimonial status
// @route   PATCH /api/testimonials/:id/status
// @access  Private/Admin
exports.updateTestimonialStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.status(200).json({ success: true, data: testimonial });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
