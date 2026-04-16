const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    console.error('Failed to parse JSON from:', url);
                    console.error('Data received:', data.substring(0, 100));
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function testApi() {
    try {
        console.log('Testing Global CMS (/cms)...');
        const res1 = await get('http://localhost:5000/cms');
        console.log('Global CMS Banners Count:', res1.data?.banners?.length || 0);

        console.log('\nTesting Tenant CMS (/cms?tenantId=69d8ad89...)...');
        const res2 = await get('http://localhost:5000/cms?tenantId=69d8ad89272d60d033bb6620');
        console.log('Tenant 69d8ad89... Banners Count:', res2.data?.banners?.length || 0);

        if (res2.data?.banners && res2.data.banners.length > 0) {
            console.log('First banner status:', res2.data.banners[0].status);
        }
    } catch (err) {
        console.error('API Test Failed:', err.message);
    }
}

testApi();
