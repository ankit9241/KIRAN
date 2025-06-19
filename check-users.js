const mongoose = require('mongoose');
const config = require('./backend/config/development.json');

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(config.mongoURI);
        console.log('Connected to MongoDB');

        const User = require('./backend/models/User');
        
        const users = await User.find().select('name email role');
        console.log('\n--- Users in Database ---');
        
        if (users.length === 0) {
            console.log('❌ No users found in database');
            console.log('You need to create an admin user first.');
            console.log('You can use the /enroll route to create an admin user.');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
            });
            
            const admins = users.filter(u => u.role === 'admin');
            if (admins.length === 0) {
                console.log('\n❌ No admin users found!');
                console.log('You need to create an admin user to access the admin dashboard.');
            } else {
                console.log(`\n✅ Found ${admins.length} admin user(s)`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkUsers(); 