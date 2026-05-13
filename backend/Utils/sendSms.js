const axios = require('axios');

/**
 * Send SMS via SMS India Hub
 * @param {string} phone - Recipient phone number
 * @param {string} message - Message content
 * @param {string} templateId - DLT Template ID
 * @returns {Promise<any>}
 */
const sendSms = async (phone, message, dltTemplateId) => {
    try {
        const username = (process.env.SMS_INDIA_HUB_USERNAME || '').trim();
        const apiKey = (process.env.SMS_INDIA_HUB_API_KEY || '').trim();
        const senderId = (process.env.SMS_INDIA_HUB_SENDER_ID || '').trim();
        const finalTemplateId = (dltTemplateId || process.env.SMS_INDIA_HUB_DLT_TEMPLATE_ID || '').trim();
        
        // Ensure phone starts with 91 for India if not already present
        let formattedPhone = phone.trim();
        if (formattedPhone.length === 10) {
            formattedPhone = '91' + formattedPhone;
        }

        const url = 'https://cloud.smsindiahub.in/vendorsms/pushsms.aspx';
        
        const params = {
            user: username,
            password: apiKey, 
            msisdn: formattedPhone,
            sid: senderId,
            msg: message,
            fl: 0,
            gwid: 2,
            TemplateId: finalTemplateId
        };

        console.log(`[SMS] Sending to ${formattedPhone} using User: ${username}, SID: ${senderId}, Template: ${params.TemplateId}`);
        
        const response = await axios.get(url, { params });
        
        console.log('[SMS] Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[SMS] Error sending SMS:', error.message);
        throw error;
    }
};

module.exports = sendSms;
