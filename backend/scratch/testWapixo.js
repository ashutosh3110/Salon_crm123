require('dotenv').config({ path: '../.env' });
const { sendWapixoTemplate } = require('../Utils/whatsapp');

async function testWapixo() {
    console.log("Testing Wapixo Template...");
    
    const resTemplate = await sendWapixoTemplate("916268204871", "booking_confirmation", [
        "John Doe", "Wapixo Salon", "Main Branch", "Mumbai", "Jane Stylist", "Haircut", "25-Jun-2026", "10:00 AM", "https://wapixo.com/app/bookings/12345"
    ]);
    console.log("Template Response:", JSON.stringify(resTemplate, null, 2));
}

testWapixo();
