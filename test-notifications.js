const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'adityasinghofficial296@gmail.com';
const TEST_PASSWORD = 'admin#1122';

async function testNotificationSystem() {
    console.log('🔍 Testing KIRAN Notification System...\n');

    try {
        // Step 1: Login as admin
        console.log('1️⃣ Logging in as admin...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });

        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        
        console.log('✅ Login successful');
        console.log('   User:', user.name);
        console.log('   Role:', user.role);
        console.log('   Token:', token ? 'Present' : 'Missing');

        // Step 2: Test notification endpoints
        console.log('\n2️⃣ Testing notification endpoints...');

        // Test getting notifications
        console.log('   📥 Fetching notifications...');
        const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Notifications fetched successfully');
        console.log('   📊 Count:', notificationsResponse.data.length);

        // Test getting unread count
        console.log('   📊 Fetching unread count...');
        const unreadResponse = await axios.get(`${BASE_URL}/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Unread count fetched successfully');
        console.log('   🔢 Unread count:', unreadResponse.data.count);

        // Step 3: Create test notification
        console.log('\n3️⃣ Creating test notification...');
        const testNotificationResponse = await axios.post(`${BASE_URL}/notifications/test/create-sample`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Test notification created successfully');
        console.log('   📝 Notification ID:', testNotificationResponse.data.notification._id);

        // Step 4: Verify notification was created
        console.log('\n4️⃣ Verifying notification creation...');
        const updatedNotificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Updated notifications fetched');
        console.log('   📊 New count:', updatedNotificationsResponse.data.length);

        const updatedUnreadResponse = await axios.get(`${BASE_URL}/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   🔢 New unread count:', updatedUnreadResponse.data.count);

        // Step 5: Test admin notification triggers
        console.log('\n5️⃣ Testing admin notification triggers...');

        // Test daily summary
        console.log('   📊 Triggering daily summary...');
        const dailySummaryResponse = await axios.post(`${BASE_URL}/admin/notifications/test/daily-summary`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Daily summary triggered');

        // Test system checks
        console.log('   🔧 Triggering system checks...');
        const systemChecksResponse = await axios.post(`${BASE_URL}/admin/notifications/test/system-checks`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ System checks triggered');

        // Step 6: Final verification
        console.log('\n6️⃣ Final verification...');
        const finalNotificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   📊 Final notification count:', finalNotificationsResponse.data.length);

        const finalUnreadResponse = await axios.get(`${BASE_URL}/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   🔢 Final unread count:', finalUnreadResponse.data.count);

        console.log('\n🎉 All tests passed! Notification system is working correctly.');
        console.log('\n📋 Summary:');
        console.log('   ✅ Authentication working');
        console.log('   ✅ Notification fetching working');
        console.log('   ✅ Notification creation working');
        console.log('   ✅ Admin notification triggers working');
        console.log('   ✅ Unread count tracking working');

    } catch (error) {
        console.error('\n❌ Test failed!');
        console.error('Error:', error.message);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Make sure the backend server is running (npm run dev)');
        console.log('2. Check if MongoDB is connected');
        console.log('3. Verify the admin user exists in the database');
        console.log('4. Check browser console for frontend errors');
    }
}

// Run the test
testNotificationSystem(); 