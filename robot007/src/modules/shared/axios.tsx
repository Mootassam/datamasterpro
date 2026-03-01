import Axios from 'axios';

const authAxios = Axios.create({
  baseURL: 'http://159.198.47.173:8088/api',
});

// Request interceptor
authAxios.interceptors.request.use(
  (config) => {
    // You can modify the request config here (e.g., add auth tokens)
    return config;
  },
  (error) => {
    console.log('Request error: ', error);
    return Promise.reject(error);
  }
);

// Add default headers via request interceptor
authAxios.interceptors.request.use(
  async function (config) {
    config.headers = config.headers || {};
    (config.headers as any)['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  function (error) {
    console.log('Request error: ', error);
    return Promise.reject(error);
  },
);

// Response interceptor
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Response error: ', error);
    return Promise.reject(error);
  }
);

export default authAxios;
