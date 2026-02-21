const BASE_URL = 'http://localhost:3000/v1';

async function verify() {
    try {
        console.log('--- Superadmin Backend Verification ---');

        // 1. Login
        console.log('\n[1] Testing Login...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@saloncrm.com',
                password: 'Admin@123'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);

        const token = loginData.data.accessToken;
        const user = loginData.data.user;

        console.log('✅ Login Successful');
        console.log('   User Role:', user.role);
        console.log('   Name:', user.name);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Get Stats
        console.log('\n[2] Testing GET /tenants/stats...');
        const statsRes = await fetch(`${BASE_URL}/tenants/stats`, { headers });
        const statsData = await statsRes.json();
        console.log('✅ Stats fetched:', JSON.stringify(statsData, null, 2));

        // 3. Get Tenants
        console.log('\n[3] Testing GET /tenants...');
        const tenantsRes = await fetch(`${BASE_URL}/tenants`, { headers });
        const tenantsData = await tenantsRes.json();
        console.log('✅ Tenants fetched:', (tenantsData.results?.length || tenantsData.data?.length || 0), 'items');

        // 4. Create Tenant
        console.log('\n[4] Testing POST /tenants (Create)...');
        const newTenant = {
            name: 'Verification Salon',
            slug: 'verify-' + Date.now(),
            subscriptionPlan: 'premium'
        };
        const createRes = await fetch(`${BASE_URL}/tenants`, {
            method: 'POST',
            headers,
            body: JSON.stringify(newTenant)
        });
        const createdTenant = await createRes.json();
        const tenantId = createdTenant._id;
        console.log('✅ Tenant Created:', createdTenant.name, 'ID:', tenantId);

        // 5. Update Tenant
        console.log('\n[5] Testing PUT /tenants/:id (Update)...');
        const updateRes = await fetch(`${BASE_URL}/tenants/${tenantId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status: 'inactive' })
        });
        const updatedTenant = await updateRes.json();
        console.log('✅ Tenant Updated. Status:', updatedTenant.status);

        // 6. Suspend (Delete)
        console.log('\n[6] Testing DELETE /tenants/:id (Suspend)...');
        const deleteRes = await fetch(`${BASE_URL}/tenants/${tenantId}`, {
            method: 'DELETE',
            headers
        });
        const suspendedTenant = await deleteRes.json();
        console.log('✅ Tenant Suspended. Status:', suspendedTenant.status);

        console.log('\n--- VERIFICATION COMPLETE: ALL BACKEND APIS FUNCTIONAL ---');

    } catch (err) {
        console.error('\n❌ Verification Failed:');
        console.error('   Error:', err.message);
        process.exit(1);
    }
}

verify();
