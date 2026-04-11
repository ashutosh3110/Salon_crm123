const Cms = require('../Models/Cms');

// @desc    Get all CMS data (optionally filtered by tenantId)
// @route   GET /api/cms
// @access  Public
exports.getCmsData = async (req, res) => {
    try {
        const tenantId = req.query.tenantId || null;
        const query = tenantId ? { tenantId } : { tenantId: null };
        const cmsItems = await Cms.find(query);
        const data = {};
        cmsItems.forEach(item => {
            data[item.section] = item.content;
        });
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update CMS section (scoped by tenantId)
// @route   PATCH /api/cms/:section
// @access  Private/Admin
exports.updateCmsSection = async (req, res) => {
    try {
        const { section } = req.params;
        const { content } = req.body;
        
        let tenantId = null;
        if (req.user && req.user.role !== 'superadmin') {
            tenantId = req.user.tenantId || req.query.tenantId;
        } else if (req.query.tenantId) {
            tenantId = req.query.tenantId;
        }

        let cmsItem = await Cms.findOne({ section, tenantId });
        if (cmsItem) {
            cmsItem.content = content;
            await cmsItem.save();
        } else {
            cmsItem = await Cms.create({ section, content, tenantId });
        }

        res.status(200).json({ success: true, data: cmsItem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
