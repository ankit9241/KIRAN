const axios = require('axios');

async function createAdminViaAPI() {
    try {
        console.log('Creating admin user via API...');
        
        const response = await axios.post('http://localhost:5000/api/auth/create-admin');
        
        console.log('✅ Success!');
        console.log('Response:', response.data);
        console.log('\nAdmin credentials:');
        console.log('Email: adityasinghofficial296@gmail.com');
        console.log('Password: admin#1122');
        
    } catch (error) {
        console.error('❌ Error creating admin:', error.response?.data || error.message);
        console.log('\nMake sure your backend server is running on port 5000');
    }
}

createAdminViaAPI(); 