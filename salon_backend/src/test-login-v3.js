async function testLogin() {
    try {
        const response = await fetch('http://localhost:3000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'password123'
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Login Success!');
            // Accessing result.data.user instead of result.user
            console.log('User Role:', result.data.user.role);
            console.log('Token Length:', result.data.accessToken.length);
        } else {
            const err = await response.json();
            console.error('Login Failed:', err);
        }
    } catch (error) {
        console.error('Network Error:', error.message);
    }
}

testLogin();
