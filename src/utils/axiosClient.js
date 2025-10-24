import axios from 'axios';

// Use the environment variable, falling back to localhost for safety during development
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;