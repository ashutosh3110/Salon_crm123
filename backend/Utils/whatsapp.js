const axios = require('axios');

/**
 * Send WhatsApp Template Message using Meta Cloud API
 * @param {string} to - Recipient phone number (with country code, no plus sign)
 * @param {string} templateName - Name of the approved template
 * @param {Array} parameters - Array of text parameters for the body {{1}}, {{2}}, etc.
 * @param {string} headerUrl - Optional URL for media header
 */
exports.sendWhatsAppTemplate = async (to, templateName, parameters = [], headerUrl = null) => {
    try {
        console.log(`[WhatsApp-Template] Initiated sending. To: ${to}, Template: ${templateName}, Params: ${JSON.stringify(parameters)}, HeaderUrl: ${headerUrl}`);
        const token = process.env.WHATSAPP_CLOUD_TOKEN;
        const phoneId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
        const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en';

        if (!token || !phoneId) {
            // Fallback to Wapixo if Meta credentials missing
            if (process.env.WAPIXO_ACCESS_TOKEN && process.env.WAPIXO_VENDOR_UID) {
                console.log('[WhatsApp-Template] Meta Cloud API credentials missing. Falling back to Wapixo...');
                return exports.sendWapixoTemplate(to, templateName, parameters, headerUrl);
            }
            console.error('[WhatsApp-Template] WhatsApp credentials missing in .env');
            return { success: false, message: 'WhatsApp credentials missing' };
        }

        let cleanTo = to.replace(/[^0-9]/g, '');
        if (cleanTo.length === 10) cleanTo = '91' + cleanTo;

        const components = [
            {
                type: "body",
                parameters: parameters.map(text => ({
                    type: "text",
                    text: text
                }))
            }
        ];

        if (headerUrl) {
            components.push({
                type: "header",
                parameters: [
                    {
                        type: "document",
                        document: {
                            link: headerUrl,
                            filename: "Invoice.pdf"
                        }
                    }
                ]
            });
        }

        const payload = {
            messaging_product: "whatsapp",
            to: cleanTo,
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: languageCode
                },
                components
            }
        };

        const targetUrl = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
        console.log(`[WhatsApp-Template] Sending request to URL: ${targetUrl}`);
        console.log('[WhatsApp-Template] Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            targetUrl,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log('[WhatsApp-Template] API Success Response:', JSON.stringify(response.data, null, 2));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("[WhatsApp-Template] API Error:", error.response?.data || error.message);
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
        console.log(`[WhatsApp-Message] Initiated sending. To: ${to}, Message: ${message}`);
        const token = process.env.WHATSAPP_CLOUD_TOKEN;
        const phoneId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;

        if (!token || !phoneId) {
            // Fallback to Wapixo if Meta credentials missing
            if (process.env.WAPIXO_ACCESS_TOKEN && process.env.WAPIXO_VENDOR_UID) {
                console.log('[WhatsApp-Message] Meta Cloud API credentials missing. Falling back to Wapixo...');
                return exports.sendWapixoMessage(to, message);
            }
            console.error('[WhatsApp-Message] WhatsApp credentials missing in .env');
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

        const targetUrl = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
        console.log(`[WhatsApp-Message] Sending request to URL: ${targetUrl}`);
        console.log('[WhatsApp-Message] Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            targetUrl,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log('[WhatsApp-Message] API Success Response:', JSON.stringify(response.data, null, 2));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("[WhatsApp-Message] API Error:", error.response?.data || error.message);
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
 * @param {string} headerUrl - Optional URL for media header (Image/Document)
 */
exports.sendWapixoTemplate = async (to, templateName, parameters = [], headerUrl = null) => {
    try {
        console.log(`[Wapixo-Template] Initiated sending. To: ${to}, Template: ${templateName}, Params: ${JSON.stringify(parameters)}, HeaderUrl: ${headerUrl}`);
        const vendorUid = process.env.WAPIXO_VENDOR_UID;
        const accessToken = process.env.WAPIXO_ACCESS_TOKEN;
        const baseUrl = process.env.WAPIXO_API_BASE_URL || 'https://wa.wapixo.com/api';
        const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en';

        if (!vendorUid || !accessToken) {
            console.error('[Wapixo-Template] Wapixo credentials missing in .env');
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

        if (headerUrl) {
            payload.header_document = headerUrl;
            payload.header_document_name = "Invoice.pdf";
        }

        // Wapixo requires message_body even for templates in some versions
        payload.message_body = `Template: ${templateName}`;

        const targetUrl = `${baseUrl}/${vendorUid}/contact/send-template-message?token=${accessToken}`;
        console.log(`[Wapixo-Template] Sending request to URL: ${baseUrl}/${vendorUid}/contact/send-template-message?token=${accessToken.substring(0, 5)}...`);
        console.log('[Wapixo-Template] Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            targetUrl,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        console.log('[Wapixo-Template] API Success Response:', JSON.stringify(response.data, null, 2));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("[Wapixo-Template] API Error:", error.response?.data || error.message);
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
        console.log(`[Wapixo-Message] Initiated sending. To: ${to}, Message: ${message}`);
        const vendorUid = process.env.WAPIXO_VENDOR_UID;
        const accessToken = process.env.WAPIXO_ACCESS_TOKEN;
        const baseUrl = process.env.WAPIXO_API_BASE_URL || 'https://wa.wapixo.com/api';

        if (!vendorUid || !accessToken) {
            console.error('[Wapixo-Message] Wapixo credentials missing in .env');
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

        const targetUrl = `${baseUrl}/${vendorUid}/contact/send-message?token=${accessToken}`;
        console.log(`[Wapixo-Message] Sending request to URL: ${baseUrl}/${vendorUid}/contact/send-message?token=${accessToken.substring(0, 5)}...`);
        console.log('[Wapixo-Message] Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            targetUrl,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        console.log('[Wapixo-Message] API Success Response:', JSON.stringify(response.data, null, 2));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("[Wapixo-Message] API Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.message || error.message,
            details: error.response?.data
        };
    }
};

/**
 * Check if an outlet has active WhatsApp credits and deduct 1 if so.
 * @param {string} outletId - The ID of the outlet
 * @returns {Promise<boolean>} - Returns true if credit was deducted and message can be sent
 */
exports.checkAndDeductWhatsAppCredit = async (id) => {
    try {
        if (!id) return false;
        
        const Outlet = require('../Models/Outlet');
        const Salon = require('../Models/Salon');
        
        let salon;
        
        // 1. Try finding by Outlet ID first
        const outlet = await Outlet.findById(id);
        if (outlet) {
            salon = await Salon.findById(outlet.salonId);
        } else {
            // 2. If not an outlet, check if it's a Salon ID
            salon = await Salon.findById(id);
        }

        if (!salon || !salon.whatsappSettings) {
            console.log(`[WhatsApp-Credit] Failed: Salon not found for ID ${id}`);
            return false;
        }
        
        const { whatsappNotifications, whatsappCredits } = salon.whatsappSettings;
        
        // 1. Check if feature is enabled for this salon
        if (whatsappNotifications === false) {
            console.log(`[WhatsApp-Credit] Failed: WhatsApp disabled for salon ${salon._id}`);
            return false;
        }
        
        // 2. Check credits
        if (!whatsappCredits || whatsappCredits <= 0) {
            console.log(`[WhatsApp-Credit] Failed: No credits remaining for salon ${salon._id}`);
            return false;
        }
        
        // 3. Deduct 1 credit
        salon.whatsappSettings.whatsappCredits = Math.max(0, (salon.whatsappSettings.whatsappCredits || 0) - 1);
        await salon.save();
        
        console.log(`[WhatsApp-Credit] Success: 1 credit deducted. Remaining: ${salon.whatsappSettings.whatsappCredits} for salon ${salon._id}`);
        return true;
    } catch (err) {
        console.error('[WhatsApp-Credit] Error:', err.message);
        return false;
    }
};
