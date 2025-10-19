// config.js
const API_CONFIG = {
  // REPLACE THIS URL with your Render backend URL
  BACKEND_URL: 'https://gynai-web-1.onrender.com',
  
  getBaseURL: function() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:5001';
    }
    return this.BACKEND_URL;
  }
};

const API_BASE_URL = API_CONFIG.getBaseURL();
console.log('Using API:', API_BASE_URL);