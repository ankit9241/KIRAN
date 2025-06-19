const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ankit:ankit123@cluster0.mongodb.net/mentor?retryWrites=true&w=majority';

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'adityasinghofficial296@gmail.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists. Updating password...');
            
            // Update password
            const hashedPassword = await bcrypt.hash('admin#1122', 10);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            
            console.log('✅ Admin user updated successfully!');
            console.log('Email: adityasinghofficial296@gmail.com');
            console.log('Password: admin#1122');
        } else {
            console.log('Creating new admin user...');
            
            // Create new admin user
            const hashedPassword = await bcrypt.hash('admin#1122', 10);
            const adminUser = new User({
                name: 'Admin',
                email: 'adityasinghofficial296@gmail.com',
                password: hashedPassword,
                role: 'admin'
            });

            await adminUser.save();
            console.log('✅ Admin user created successfully!');
            console.log('Email: adityasinghofficial296@gmail.com');
            console.log('Password: admin#1122');
        }

        // Verify the admin user exists
        const adminUser = await User.findOne({ email: 'adityasinghofficial296@gmail.com' });
        if (adminUser) {
            console.log('\n✅ Admin user verified in database:');
            console.log(`Name: ${adminUser.name}`);
            console.log(`Email: ${adminUser.email}`);
            console.log(`Role: ${adminUser.role}`);
            console.log(`Created: ${adminUser.createdAt}`);
        }

        // List all admin users
        console.log('\n=== All Admin Users ===');
        const allAdmins = await User.find({ role: 'admin' }, 'name email createdAt');
        allAdmins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.name} (${admin.email}) - Created: ${admin.createdAt.toLocaleDateString()}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

createAdminUser(); 