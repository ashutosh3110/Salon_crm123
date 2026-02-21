import axios from 'axios';

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@example.com',
            password: 'password123'
        });
        console.log('Login Success!');
        console.log('User Role:', response.data.user.role);
        console.log('Token Length:', response.data.token.length);
    } catch (error) {
        console.error('Login Failed:', error.response?.data || error.message);
    }
}

testLogin();
