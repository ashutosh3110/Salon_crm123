const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sendWhatsAppTemplate } = require('../Utils/whatsapp');

async function runTest() {
    console.log('🚀 Starting WhatsApp API Test...');
    
    const testNumber = process.env.ADMIN_WHATSAPP_NUMBER || '916268204871';
    const templateName = 'hello'; // Using the approved 'hello' template
    
    console.log(`📱 Sending to: ${testNumber}`);
    console.log(`📄 Using Template: ${templateName}`);
    
    const result = await sendWhatsAppTemplate(testNumber, templateName, []);
    
    if (result.success) {
        console.log('✅ Success! Message sent successfully.');
        console.log('API Response:', JSON.stringify(result.data, null, 2));
    } else {
        console.error('❌ Failed! Could not send message.');
        console.error('Error:', result.message);
        if (result.details) {
            console.error('Details:', JSON.stringify(result.details, null, 2));
        }
    }
}

runTest();
