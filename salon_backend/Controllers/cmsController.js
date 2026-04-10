const Cms = require('../Models/Cms');

// @desc    Get all CMS data
// @route   GET /api/cms
// @access  Public
exports.getCmsData = async (req, res) => {
    try {
        const cmsItems = await Cms.find();
        const data = {};
        cmsItems.forEach(item => {
            data[item.section] = item.content;
        });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update CMS section
// @route   PATCH /api/cms/:section
// @access  Private/SuperAdmin
exports.updateCmsSection = async (req, res) => {
    try {
        const { section } = req.params;
        const { content } = req.body;

        let cmsItem = await Cms.findOne({ section });
        if (cmsItem) {
            cmsItem.content = content;
            await cmsItem.save();
        } else {
            cmsItem = await Cms.create({ section, content });
        }

        res.status(200).json({ success: true, data: cmsItem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
