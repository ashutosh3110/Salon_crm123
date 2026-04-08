import axios from 'axios';

/**
 * WhatsApp Service Placeholder (Meta Cloud API Integration)
 */
class WhatsAppService {
    constructor() {
        this.token = process.env.WHATSAPP_CLOUD_TOKEN || process.env.WHATSAPP_TOKEN;
        this.phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.version = 'v20.0';
        this.baseUrl = `https://graph.facebook.com/${this.version}/${this.phoneNumberId}/messages`;
        
        if (this.token && this.phoneNumberId) {
            console.log(`[WHATSAPP-SYSTEM] Initialized with PhoneID: ${this.phoneNumberId} (Ready)`);
        } else {
            console.warn(`[WHATSAPP-SYSTEM] WARNING: Missing Token or Phone Number ID in .env. System will run in Simulation Mode.`);
        }
    }

    /**
     * Send a template message (Recommended for business notifications)
     * @param {string} to - Recipient phone number (with country code, e.g. 919876543210)
     * @param {string} templateName - Approved template name in Meta dashboard
     * @param {Array} components - Values for {{1}}, {{2}} in template
     * @param {string} languageCode - Default is 'en_US' or 'hi'
     */
    async sendTemplateMessage(to, templateName, components = [], languageCode = 'en_US') {
        // Ensure number has country code 91 if it starts with 10 digits
        let target = String(to).trim().replace(/\D/g, '');
        if (target.length === 10) target = '91' + target;
        
        console.log(`[WHATSAPP-DEBUG] Preparing to send: Target=${target}, Template=${templateName}`);
        
        const payload = {
            messaging_product: 'whatsapp',
            to: target,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
                components: [
                    {
                        type: 'body',
                        parameters: components.map(val => ({ type: 'text', text: String(val) }))
                    }
                ]
            }
        };

        if (!this.token || !this.phoneNumberId) {
            console.warn(`[WHATSAPP-SIMULATION] No API credentials. Skipping send.`);
            return { success: true, simulated: true };
        }

        // Preview for the user in terminal
        const previewText = components.length > 0 
            ? `PREVIEW (Approx): Hello ${components[0]}, your booking for ${components[1]} is confirmed! Order ID: ${components[2]} on ${components[3]}.`
            : `Template: ${templateName} (No variables)`;
        
        console.log('=========================================');
        console.log(`[WHATSAPP-PREVIEW] Content: ${previewText}`);
        console.log('=========================================');

        try {
            console.log('[WHATSAPP-DEBUG] Sending to Meta API with Payload:', JSON.stringify(payload, null, 2));
            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`[WHATSAPP-SUCCESS] Meta Accepted! ID: ${response.data.messages[0].id}`);
            return { success: true, data: response.data };
        } catch (error) {
            const apiError = error.response?.data?.error || { message: error.message };
            console.error(`[WHATSAPP-ERROR] Meta Rejected Request:`, JSON.stringify(apiError, null, 2));
            
            // Suggesting local fix instructions based on common error codes
            if (apiError.code === 131030) console.warn('[WHATSAPP-HINT] Parameter mismatch! Check if your template actually expects 4 variables.');
            if (apiError.code === 132001) console.warn('[WHATSAPP-HINT] Template not found! Check your .env WHATSAPP_TEMPLATE_BOOKING_LINK.');
            
            throw new Error(`WhatsApp API Error: ${apiError.message}`);
        }
    }

    /**
     * Send a simple text message (Only works if customer has replied in last 24h)
     */
    async sendTextMessage(to, text) {
        if (!this.token || !this.phoneNumberId) {
            console.warn(`[WHATSAPP-PLACEHOLDER] Text message simulation: TO: ${to} | BODY: ${text}`);
            return { success: true, simulated: true };
        }

        try {
            const response = await axios.post(this.baseUrl, {
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { body: text }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`[WHATSAPP-ERROR] Failed to send text:`, error.response?.data || error.message);
            throw error;
        }
    }
}

export default new WhatsAppService();
