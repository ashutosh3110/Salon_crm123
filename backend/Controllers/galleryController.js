const StylistGallery = require('../Models/StylistGallery');

// @desc    Get all gallery items for the logged-in stylist
// @route   GET /api/gallery/me
// @access  Private
exports.getMyGallery = async (req, res) => {
    try {
        const items = await StylistGallery.find({ staffId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add a new gallery item
// @route   POST /api/gallery
// @access  Private
exports.addGalleryItem = async (req, res) => {
    try {
        const { title, description, category, imageUrl, tags } = req.body;

        if (!title || !category || !imageUrl) {
            return res.status(400).json({ success: false, message: 'Please provide title, category, and imageUrl' });
        }

        if (!req.user.salonId) {
            return res.status(400).json({ success: false, message: 'User does not belong to a salon' });
        }

        const parsedTags = Array.isArray(tags) 
            ? tags 
            : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

        const newItem = await StylistGallery.create({
            staffId: req.user._id,
            salonId: req.user.salonId,
            title,
            description,
            category,
            imageUrl,
            tags: parsedTags
        });

        res.status(201).json({ success: true, data: newItem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update a gallery item
// @route   PUT /api/gallery/:id
// @access  Private
exports.updateGalleryItem = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;

        const item = await StylistGallery.findOne({ _id: req.params.id, staffId: req.user._id });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Gallery item not found or unauthorized' });
        }

        if (title !== undefined) item.title = title;
        if (description !== undefined) item.description = description;
        if (category !== undefined) item.category = category;
        if (tags !== undefined) {
            item.tags = Array.isArray(tags) 
                ? tags 
                : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
        }

        await item.save();
        res.status(200).json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private
exports.deleteGalleryItem = async (req, res) => {
    try {
        const item = await StylistGallery.findOne({ _id: req.params.id, staffId: req.user._id });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Gallery item not found or unauthorized' });
        }

        await item.deleteOne();
        res.status(200).json({ success: true, message: 'Gallery item deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
