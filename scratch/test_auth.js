const BASE_URL = 'http://localhost:8080/api';

async function runTests() {
  console.log('🚀 Starting Automated Auth, Role & Email Invitation System Verification...\n');

  // Test 1: Verify anonymous request is blocked
  console.log('Test 1: Verify anonymous request to /api/residents is blocked');
  try {
    const res = await fetch(`${BASE_URL}/residents`);
    console.log(`Status: ${res.status} (Expected: 401)`);
    const data = await res.json();
    console.log(`Response:`, data);
    if (res.status === 401) {
      console.log('✅ Test 1 Passed!\n');
    } else {
      console.log('❌ Test 1 Failed!\n');
    }
  } catch (err) {
    console.error('❌ Test 1 Error:', err.message);
  }

  // Test 2: Log in as seeded default admin user
  console.log('Test 2: Log in as default admin user');
  let adminToken = '';
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    console.log(`Status: ${res.status} (Expected: 200)`);
    const data = await res.json();
    console.log('Response Keys:', Object.keys(data));
    console.log('User Role:', data.user?.role);
    if (res.status === 200 && data.token && data.user?.role === 'ADMIN') {
      adminToken = data.token;
      console.log('✅ Test 2 Passed!\n');
    } else {
      console.log('❌ Test 2 Failed!\n');
    }
  } catch (err) {
    console.error('❌ Test 2 Error:', err.message);
  }

  if (!adminToken) {
    console.log('⚠️ Aborting remaining tests: Admin login failed.');
    return;
  }

  // Test 3: Retrieve residents with valid admin token
  console.log('Test 3: Retrieve residents using admin token');
  try {
    const res = await fetch(`${BASE_URL}/residents`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`Status: ${res.status} (Expected: 200)`);
    const data = await res.json();
    console.log(`Retrieved residents count: ${Array.isArray(data) ? data.length : 'Not an array'}`);
    if (res.status === 200 && Array.isArray(data)) {
      console.log('✅ Test 3 Passed!\n');
    } else {
      console.log('❌ Test 3 Failed!\n');
    }
  } catch (err) {
    console.error('❌ Test 3 Error:', err.message);
  }

  // Test 4: Generate a unique Email-bound Read-Only invitation (Admin only)
  console.log('Test 4: Generate a unique Email-bound Read-Only invitation');
  let inviteToken = '';
  const testEmail = `invited_user_${Date.now()}@ashdot.co.il`;
  try {
    const res = await fetch(`${BASE_URL}/auth/invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ role: 'READ_ONLY', email: testEmail })
    });
    console.log(`Status: ${res.status} (Expected: 200)`);
    const data = await res.json();
    console.log('Invite Role:', data.role);
    console.log('Invite Email:', data.email);
    console.log('Invite Token:', data.token);
    if (res.status === 200 && data.token && data.role === 'READ_ONLY' && data.email === testEmail) {
      inviteToken = data.token;
      console.log('✅ Test 4 Passed!\n');
    } else {
      console.log('❌ Test 4 Failed!\n');
    }
  } catch (err) {
    console.error('❌ Test 4 Error:', err.message);
  }

  if (!inviteToken) {
    console.log('⚠️ Aborting remaining tests: Invite generation failed.');
    return;
  }

  // Test 5: Verify public invitation check details return the locked email
  console.log('Test 5: Verify invitation verification yields pre-filled locked email');
  try {
    const res = await fetch(`${BASE_URL}/auth/invitation/${inviteToken}`);
    console.log(`Status: ${res.status} (Expected: 200)`);
    const data = await res.json();
    console.log('Verified Role:', data.role);
    console.log('Verified Pre-filled Email:', data.email);
    if (res.status === 200 && data.valid && data.email === testEmail) {
      console.log('✅ Test 5 Passed!\n');
    } else {
      console.log('❌ Test 5 Failed!\n');
    }
  } catch (err) {
    console.error('❌ Test 5 Error:', err.message);
  }

  // Test 6: Register new Read-Only user
  console.log('Test 6: Register new Read-Only user (email is auto-bound to invitation)');
  const testUsername = `readonly_${Date.now()}`;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: inviteToken,
        username: testUsername,
        password: 'password123'
      })
    });
    console.log(`Status: ${res.status} (Expected: 200)`);
    const data = await res.json();
    console.log('Register Response:', data);
    if (res.status === 200 && data.success && data.user?.email === testEmail) {
      console.log('✅ Test 6 Passed!\n');
    } else {
      console.log('❌ Test 6 Failed!\n');
    }
  } catch (err) {
    console.error('❌ Test 6 Error:', err.message);
  }

  // Test 7: Log in as the new Read-Only user and verify email is in profile
  console.log('Test 7: Log in as new Read-Only user');
  let readOnlyToken = '';
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUsername, password: 'password123' })
    });
    console.log(`Status: ${res.status} (Expected: 200)`);
    const data = await res.json();
    console.log('Role Returned:', data.user?.role);
    if (res.status === 200 && data.token && data.user?.role === 'READ_ONLY') {
      readOnlyToken = data.token;
      console.log('✅ Test 7 Passed!\n');
    } else {
      console.log('❌ Test 7 Failed!\n');
    }
  } catch (err) {
    console.error('❌ Test 7 Error:', err.message);
  }

  if (!readOnlyToken) {
    console.log('⚠️ Aborting remaining tests: Read-Only login failed.');
    return;
  }

  // Test 8: Verify Read-Only user cannot write (POST returns 403)
  console.log('Test 8: Verify Read-Only user cannot create a resident apartment');
  try {
    const res = await fetch(`${BASE_URL}/residents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${readOnlyToken}`
      },
      body: JSON.stringify({
        building_number: 99,
        apartment_name: 'ReadOnlyTestApt',
        floor: '1',
        tenant_name: 'Should Fail',
        owner_name: 'Kibutz',
        arnona_id: '12345',
        phone: '123',
        email: 'fail@fail.com'
      })
    });
    console.log(`Status: ${res.status} (Expected: 403)`);
    const data = await res.json();
    console.log('Response:', data);
    if (res.status === 403) {
      console.log('✅ Test 8 Passed!\n');
    } else {
      console.log('❌ Test 8 Failed!\n');
    }
  } catch (err) {
    console.error('❌ Test 8 Error:', err.message);
  }

  // Test 9: Verify duplicate email registration is blocked
  console.log('Test 9: Verify duplicate email registration is blocked');
  try {
    // 9a. Verify early-stage guard: cannot invite an email that is already registered
    console.log('Test 9a: Verify generating invitation for an already registered email fails');
    const inviteRes = await fetch(`${BASE_URL}/auth/invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ role: 'READ_ONLY', email: testEmail })
    });
    console.log(`Status: ${inviteRes.status} (Expected: 400)`);
    const inviteData = await inviteRes.json();
    console.log('Response:', inviteData);
    const earlyGuardPassed = inviteRes.status === 400 && inviteData.error && inviteData.error.includes('אימייל');
    if (earlyGuardPassed) {
      console.log('✅ Test 9a Passed (Early guard blocked duplicate email invitation)!\n');
    } else {
      console.log('❌ Test 9a Failed!\n');
    }

    // 9b. Verify registration-stage guard: cannot register if the email was registered in the meantime
    console.log('Test 9b: Verify registration fails if the email was registered in the meantime');
    
    const dupTestEmail = `dup_test_${Date.now()}@ashdot.co.il`;
    
    // Generate Invite 1 for dupTestEmail
    const inv1Res = await fetch(`${BASE_URL}/auth/invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ role: 'READ_ONLY', email: dupTestEmail })
    });
    const inv1Data = await inv1Res.json();
    const token1 = inv1Data.token;

    // Generate Invite 2 for dupTestEmail (unregistered email, so invitation generation is allowed)
    const inv2Res = await fetch(`${BASE_URL}/auth/invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ role: 'READ_ONLY', email: dupTestEmail })
    });
    const inv2Data = await inv2Res.json();
    const token2 = inv2Data.token;

    // Register User 1 using token1 -> This should succeed and register the email
    const reg1Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token1,
        username: `dup_user_1_${Date.now()}`,
        password: 'password123'
      })
    });
    console.log(`User 1 Registration Status: ${reg1Res.status} (Expected: 200)`);

    // Attempt to register User 2 using token2 -> This should fail because the email is now registered!
    const reg2Res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token2,
        username: `dup_user_2_${Date.now()}`,
        password: 'password123'
      })
    });
    console.log(`User 2 Registration Status: ${reg2Res.status} (Expected: 400)`);
    const reg2Data = await reg2Res.json();
    console.log('User 2 Registration Response:', reg2Data);

    const regGuardPassed = reg2Res.status === 400 && reg2Data.error && reg2Data.error.includes('אימייל');
    if (regGuardPassed) {
      console.log('✅ Test 9b Passed (Registration guard blocked duplicate email signup)!\n');
    } else {
      console.log('❌ Test 9b Failed!\n');
    }

    if (earlyGuardPassed && regGuardPassed) {
      console.log('✅ Test 9 Passed successfully!\n');
    } else {
      console.log('❌ Test 9 Failed!\n');
    }
  } catch (err) {
    console.error('❌ Test 9 Error:', err.message);
  }

  console.log('🏁 Automated Auth, Role & Email Invitation System Verification Complete!');
}

runTests();
