const axios = require('axios');

/**
 * Send SMS via SMS India Hub
 * @param {string} phone - Recipient phone number
 * @param {string} message - Message content
 * @param {string} templateId - DLT Template ID
 * @returns {Promise<any>}
 */
const sendSms = async (phone, message, templateId) => {
    try {
        const username = "VAHANCAB";
        const apiKey = "Vahancab!@#123";
        const senderId = "SMSHUB";
        const templateId = "1007801291964877107";
        
        // Ensure phone starts with 91 for India if not already present
        let formattedPhone = phone;
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
            gwid: 2, // Transactional
            TemplateId: templateId
        };

        console.log(`[SMS] Sending to ${formattedPhone} using User: ${username}, SID: ${senderId}, Template: ${params.TemplateId}`);
        console.log(`[SMS] Message: ${message}`);
        
        const response = await axios.post(url, null, { 
            params: params,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        console.log('[SMS] Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[SMS] Error sending SMS:', error.message);
        throw error;
    }
};

module.exports = sendSms;
