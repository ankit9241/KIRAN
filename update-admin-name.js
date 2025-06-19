const axios = require('axios');

async function updateAdminName() {
    try {
        console.log('Updating admin user name to "Admin"...');
        
        const response = await axios.post('http://localhost:5000/api/auth/create-admin');
        
        console.log('✅ Success!');
        console.log('Response:', response.data);
        console.log('\nAdmin user updated:');
        console.log('Name: Admin');
        console.log('Email: adityasinghofficial296@gmail.com');
        console.log('Password: admin#1122');
        console.log('Role: Admin (capitalized)');
        
    } catch (error) {
        console.error('❌ Error updating admin:', error.response?.data || error.message);
        console.log('\nMake sure your backend server is running on port 5000');
    }
}

updateAdminName(); 