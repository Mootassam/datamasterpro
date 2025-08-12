import Axios from 'axios';

const authAxios = Axios.create({
  baseURL: 'http://203.161.50.129:8082/api',
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

// Response interceptor
authAxios.interceptors.request.use(
  async function (options) {
   
    options.headers['ngrok-skip-browser-warning'] = 'true';

    return options;
  },
  function (error) {
    console.log('Request error: ', error);
    return Promise.reject(error);
  },
);

export default authAxios;