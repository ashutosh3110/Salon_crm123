import cmsRepository from './cms.repository.js';

const getAllCMSData = async () => {
    const data = await cmsRepository.getCMSData();
    // Transform array to object for easier consumption
    return data.reduce((acc, item) => {
        acc[item.section] = item.content;
        return acc;
    }, {});
};

const updateSection = async (section, content) => {
    return cmsRepository.updateCMSSection(section, content);
};

export default {
    getAllCMSData,
    updateSection,
};
