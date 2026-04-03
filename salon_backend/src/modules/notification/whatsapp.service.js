import axios from 'axios';

/**
 * WhatsApp Service Placeholder (Meta Cloud API Integration)
 */
class WhatsAppService {
    constructor() {
        this.token = process.env.WHATSAPP_TOKEN;
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.version = 'v17.0';
        this.baseUrl = `https://graph.facebook.net/${this.version}/${this.phoneNumberId}/messages`;
    }

    /**
     * Send a template message (Recommended for business notifications)
     * @param {string} to - Recipient phone number (with country code, e.g. 919876543210)
     * @param {string} templateName - Approved template name in Meta dashboard
     * @param {Array} components - Values for {{1}}, {{2}} in template
     * @param {string} languageCode - Default is 'en_US' or 'hi'
     */
    async sendTemplateMessage(to, templateName, components = [], languageCode = 'en_US') {
        const payload = {
            messaging_product: 'whatsapp',
            to,
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
            console.warn(`[WHATSAPP-PLACEHOLDER] API Key missing. Simulation:
            TO: ${to}
            TEMPLATE: ${templateName}
            VALUES: ${JSON.stringify(components)}`);
            return { success: true, simulated: true };
        }

        try {
            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`[WHATSAPP-SUCCESS] Message sent to ${to}. Message ID: ${response.data.messages[0].id}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`[WHATSAPP-ERROR] Failed to send to ${to}:`, error.response?.data || error.message);
            throw new Error(`WhatsApp API Error: ${error.response?.data?.error?.message || error.message}`);
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
