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
            const data = await response.json();
            console.log('Login Success!');
            console.log('User Role:', data.user.role);
            console.log('Token Length:', data.token.length);
        } else {
            const err = await response.json();
            console.error('Login Failed:', err);
        }
    } catch (error) {
        console.error('Network Error:', error.message);
    }
}

testLogin();
