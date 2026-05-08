const Promotion = require('../Models/Promotion');

exports.getPromotions = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const promos = await Promotion.find({ salonId }).sort({ createdAt: -1 });
        res.json({ success: true, results: promos, data: { results: promos } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getActivePromotions = async (req, res) => {
    try {
        const salonId = req.user?.salonId;
        const now = new Date();
        const query = { isActive: true };
        if (salonId) query.salonId = salonId;
        query.$or = [{ endDate: null }, { endDate: { $gte: now } }];
        const promos = await Promotion.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: promos });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createPromotion = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const promo = await Promotion.create({ ...req.body, salonId });
        res.status(201).json({ success: true, data: promo });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updatePromotion = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const promo = await Promotion.findOneAndUpdate(
            { _id: req.params.id, salonId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!promo) return res.status(404).json({ success: false, message: 'Promotion not found' });
        res.json({ success: true, data: promo });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deletePromotion = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const promo = await Promotion.findOneAndDelete({ _id: req.params.id, salonId });
        if (!promo) return res.status(404).json({ success: false, message: 'Promotion not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
