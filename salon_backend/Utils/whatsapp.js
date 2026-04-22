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
        const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US';

        if (!token || !phoneId) {
            console.error('WhatsApp credentials missing in .env');
            return { success: false, message: 'WhatsApp credentials missing' };
        }

        // Clean phone number (remove spaces, dashes, etc.)
        let cleanTo = to.replace(/[^0-9]/g, '');

        // If it's a 10-digit number, assume it's India (91)
        if (cleanTo.length === 10) {
            cleanTo = '91' + cleanTo;
        }

        // Add + prefix as specifically requested by the error message
        const finalTo = '+' + cleanTo;

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
