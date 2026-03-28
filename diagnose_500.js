async function diagnose() {
    try {
        const res = await fetch('http://localhost:3000/v1/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@salon.com' })
        });
        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Body:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Diagnosis Error:', err.message);
    }
}

diagnose();
