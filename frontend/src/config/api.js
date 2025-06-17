// 🌐 API Configuration for Development and Production
// Handles different API URLs based on environment

const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3001'
  },
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'https://conversaai-backend.railway.app'
  }
};

export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG[env];
};

export const API_BASE_URL = getApiConfig().baseURL;