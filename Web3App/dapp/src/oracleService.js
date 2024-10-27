import axios from 'axios';

// Function to send user data to the Flask API (oracle) and get the premium
export const getPremiumFromOracle = async (userData) => {
  try {
    const response = await axios.post('http://127.0.0.1:10000/predict', { user_data: userData });
    return response.data.predicted_premium; // Return the premium value from the response
  } catch (error) {
    console.error('Error fetching premium from Oracle:', error);
    throw new Error('Error communicating with the Oracle.');
  }
};
