import CMS from './cms.model.js';

const getCMSData = async () => {
    return CMS.find({});
};

const updateCMSSection = async (section, content) => {
    return CMS.findOneAndUpdate(
        { section },
        { content },
        { upsert: true, new: true }
    );
};

const getCMSSection = async (section) => {
    return CMS.findOne({ section });
};

export default {
    getCMSData,
    updateCMSSection,
    getCMSSection,
};
