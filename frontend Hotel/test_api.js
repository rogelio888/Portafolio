
const axios = require('axios');

async function testApi() {
    try {
        // Assuming the server is running on localhost:8000
        // We need a valid hotel ID. I'll try to fetch hotels first.
        const hotelsResponse = await axios.get('http://localhost:8000/api/hoteles');
        const hotels = hotelsResponse.data.data;

        if (hotels.length === 0) {
            console.log('No hotels found.');
            return;
        }

        const hotelId = hotels[0].id;
        console.log(`Testing with Hotel ID: ${hotelId}`);

        const response = await axios.get(`http://localhost:8000/api/habitaciones-disponibles?id_hotel=${hotelId}`);
        console.log('Response status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testApi();
