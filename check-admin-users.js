const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');

// Simple MongoDB connection string - you can replace this with your actual connection string
const MONGODB_URI = 'mongodb+srv://ankit:ankit123@cluster0.mongodb.net/mentor?retryWrites=true&w=majority';

async function checkAndCreateAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if admin users exist
        const adminUsers = await User.find({ role: 'admin' });
        console.log(`Found ${adminUsers.length} admin users:`);
        
        adminUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email})`);
        });

        if (adminUsers.length === 0) {
            console.log('\nNo admin users found. Creating a default admin user...');
            
            // Create default admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const adminUser = new User({
                name: 'Admin User',
                email: 'admin@kiran.com',
                password: hashedPassword,
                role: 'admin'
            });

            await adminUser.save();
            console.log('✅ Default admin user created successfully!');
            console.log('Email: admin@kiran.com');
            console.log('Password: admin123');
        } else {
            console.log('\nAdmin users already exist. No need to create default admin.');
        }

        // List all users by role
        console.log('\n=== All Users by Role ===');
        const allUsers = await User.find({}, 'name email role');
        
        const usersByRole = {};
        allUsers.forEach(user => {
            if (!usersByRole[user.role]) {
                usersByRole[user.role] = [];
            }
            usersByRole[user.role].push(user);
        });

        Object.keys(usersByRole).forEach(role => {
            console.log(`\n${role.toUpperCase()} (${usersByRole[role].length}):`);
            usersByRole[role].forEach(user => {
                console.log(`  - ${user.name} (${user.email})`);
            });
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkAndCreateAdmin(); 