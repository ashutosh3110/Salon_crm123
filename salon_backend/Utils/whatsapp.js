const axios = require('axios');

/**
 * Send WhatsApp Template Message using Meta Cloud API
 * @param {string} to - Recipient phone number (with country code, no plus sign)
 * @param {string} templateName - Name of the approved template
 * @param {Array} parameters - Array of text parameters for the body {{1}}, {{2}}, etc.
 */
exports.sendWhatsAppTemplate = async (to, templateName, parameters = []) => {
    try {
        const token = process.env.WHATSAPP_CLOUD_TOKEN;
        const phoneId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
        const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en';

        if (!token || !phoneId) {
            // Fallback to Wapixo if Meta credentials missing
            if (process.env.WAPIXO_ACCESS_TOKEN && process.env.WAPIXO_VENDOR_UID) {
                return exports.sendWapixoTemplate(to, templateName, parameters);
            }
            console.error('WhatsApp credentials missing in .env');
            return { success: false, message: 'WhatsApp credentials missing' };
        }

        // Clean phone number (remove spaces, dashes, etc.)
        let cleanTo = to.replace(/[^0-9]/g, '');

        // If it's a 10-digit number, assume it's India (91)
        if (cleanTo.length === 10) {
            cleanTo = '91' + cleanTo;
        }

        // Use number without + prefix as required by Meta Cloud API
        const finalTo = cleanTo;

        const payload = {
            messaging_product: "whatsapp",
            to: finalTo,
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: languageCode
                    
                },
                components: [
                    {
                        type: "body",
                        parameters: parameters.map(text => ({
                            type: "text",
                            text: text
                        }))
                    }
                ]
            }
        };

        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${phoneId}/messages`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log('WhatsApp API Response:', JSON.stringify(response.data, null, 2));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("WhatsApp API Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.error?.message || error.message,
            details: error.response?.data
        };
    }
};

/**
 * Send Plain Text WhatsApp Message
 * @param {string} to - Recipient phone number
 * @param {string} message - Message body text
 */
exports.sendWhatsAppMessage = async (to, message) => {
    try {
        const token = process.env.WHATSAPP_CLOUD_TOKEN;
        const phoneId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;

        if (!token || !phoneId) {
            // Fallback to Wapixo if Meta credentials missing
            if (process.env.WAPIXO_ACCESS_TOKEN && process.env.WAPIXO_VENDOR_UID) {
                return exports.sendWapixoMessage(to, message);
            }
            console.error('WhatsApp credentials missing in .env');
            return { success: false, message: 'WhatsApp credentials missing' };
        }

        // Clean phone number
        let cleanTo = to.replace(/[^0-9]/g, '');
        if (cleanTo.length === 10) {
            cleanTo = '91' + cleanTo;
        }

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanTo,
            type: "text",
            text: {
                preview_url: false,
                body: message
            }
        };

        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${phoneId}/messages`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return { success: true, data: response.data };
    } catch (error) {
        console.error("WhatsApp API Text Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.error?.message || error.message,
            details: error.response?.data
        };
    }
};

/**
 * Send WhatsApp Template Message using Wapixo API
 * @param {string} to - Recipient phone number
 * @param {string} templateName - Name of the approved template
 * @param {Array} parameters - Array of text parameters
 */
exports.sendWapixoTemplate = async (to, templateName, parameters = []) => {
    try {
        const vendorUid = process.env.WAPIXO_VENDOR_UID;
        const accessToken = process.env.WAPIXO_ACCESS_TOKEN;
        const baseUrl = process.env.WAPIXO_API_BASE_URL || 'https://wa.wapixo.com/api';
        const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en';

        if (!vendorUid || !accessToken) {
            console.error('Wapixo credentials missing in .env');
            return { success: false, message: 'Wapixo credentials missing' };
        }

        // Clean phone number
        let cleanTo = to.replace(/[^0-9]/g, '');
        if (cleanTo.length === 10) {
            cleanTo = '91' + cleanTo;
        }

        const payload = {
            phone_number: cleanTo,
            template_name: templateName,
            template_language: languageCode,
        };

        // Map parameters to field_1, field_2, etc.
        parameters.forEach((param, index) => {
            payload[`field_${index + 1}`] = param;
        });

        // Wapixo requires message_body even for templates in some versions
        payload.message_body = `Template: ${templateName}`;

        console.log('Sending Wapixo Template Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            `${baseUrl}/${vendorUid}/contact/send-template-message?token=${accessToken}`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        console.log('Wapixo API Response:', JSON.stringify(response.data, null, 2));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Wapixo API Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.message || error.message,
            details: error.response?.data
        };
    }
};

/**
 * Send Plain Text WhatsApp Message using Wapixo API
 * @param {string} to - Recipient phone number
 * @param {string} message - Message body text
 */
exports.sendWapixoMessage = async (to, message) => {
    try {
        const vendorUid = process.env.WAPIXO_VENDOR_UID;
        const accessToken = process.env.WAPIXO_ACCESS_TOKEN;
        const baseUrl = process.env.WAPIXO_API_BASE_URL || 'https://wa.wapixo.com/api';

        if (!vendorUid || !accessToken) {
            console.error('Wapixo credentials missing in .env');
            return { success: false, message: 'Wapixo credentials missing' };
        }

        // Clean phone number
        let cleanTo = to.replace(/[^0-9]/g, '');
        if (cleanTo.length === 10) {
            cleanTo = '91' + cleanTo;
        }

        const payload = {
            phone_number: cleanTo,
            message_body: message
        };

        const response = await axios.post(
            `${baseUrl}/${vendorUid}/contact/send-message?token=${accessToken}`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return { success: true, data: response.data };
    } catch (error) {
        console.error("Wapixo API Text Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.message || error.message,
            details: error.response?.data
        };
    }
};
