import axios from 'axios';

async function test() {
    try {
        console.log('Sending request to http://localhost:3000/v1/services/bulk-import');
        const res = await axios.post('http://localhost:3000/v1/services/bulk-import', {}, {
            validateStatus: () => true
        });
        console.log('Response Status:', res.status);
        console.log('Response Body:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Request failed:', err.message);
    }
}

test();
