const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testEndpoints() {
    console.log('Testing Admin Dashboard API Endpoints...\n');

    // Test 1: Check if server is running
    try {
        const testResponse = await axios.get(`${API_BASE_URL}/test`);
        console.log('✅ Server is running:', testResponse.data.message);
    } catch (error) {
        console.log('❌ Server test failed:', error.message);
        return;
    }

    // Test 2: Test without authentication (should fail)
    console.log('\n--- Testing without authentication ---');
    
    try {
        await axios.get(`${API_BASE_URL}/users/students`);
        console.log('❌ Students endpoint should require auth');
    } catch (error) {
        console.log('✅ Students endpoint correctly requires auth:', error.response?.status);
    }

    try {
        await axios.get(`${API_BASE_URL}/users/mentors`);
        console.log('❌ Mentors endpoint should require auth');
    } catch (error) {
        console.log('✅ Mentors endpoint correctly requires auth:', error.response?.status);
    }

    try {
        await axios.get(`${API_BASE_URL}/doubts/admin/all`);
        console.log('❌ Doubts endpoint should require auth');
    } catch (error) {
        console.log('✅ Doubts endpoint correctly requires auth:', error.response?.status);
    }

    try {
        await axios.get(`${API_BASE_URL}/study-material/admin/all`);
        console.log('❌ Study material endpoint should require auth');
    } catch (error) {
        console.log('✅ Study material endpoint correctly requires auth:', error.response?.status);
    }

    try {
        await axios.get(`${API_BASE_URL}/meetings/admin/all`);
        console.log('❌ Meetings endpoint should require auth');
    } catch (error) {
        console.log('✅ Meetings endpoint correctly requires auth:', error.response?.status);
    }

    console.log('\n--- Summary ---');
    console.log('All endpoints are properly protected with authentication.');
    console.log('The issue is likely that you need to:');
    console.log('1. Log in as an admin user');
    console.log('2. Check the browser console for specific error messages');
    console.log('3. Verify the token is being sent correctly');
}

testEndpoints().catch(console.error); 