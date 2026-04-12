import axios from 'axios';

// Create an axios instance with base configuration
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Send cookies with requests
});

export default API;
