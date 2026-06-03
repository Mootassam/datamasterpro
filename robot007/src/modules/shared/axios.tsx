import Axios from 'axios';

const BASE_URL = 'http://162.0.230.49:8087/api';

interface RetryConfig {
  _retryCount?: number;
}

const authAxios = Axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Attach common headers on every request
authAxios.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    (config.headers as any)['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry with exponential back-off for network errors and 5xx/429 responses
const MAX_RETRIES = 3;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

authAxios.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const config: RetryConfig & typeof error.config = error.config;
    if (!config) return Promise.reject(error);

    config._retryCount = config._retryCount ?? 0;

    const httpStatus: number | undefined = error.response?.status;

    const shouldRetry =
      config._retryCount < MAX_RETRIES &&
      (!httpStatus || RETRYABLE_STATUS.has(httpStatus));

    if (shouldRetry) {
      config._retryCount += 1;
      const backoffMs = Math.min(1000 * 2 ** (config._retryCount - 1), 10000);
      await new Promise<void>((resolve) => setTimeout(resolve, backoffMs));
      return authAxios(config);
    }

    if (!Axios.isCancel(error)) {
      const status = error.response?.status;
      const msg    = error.response?.data?.message || error.message;
      console.error(`[API] ${status ?? 'NET'} ${config.url} — ${msg}`);
    }

    return Promise.reject(error);
  }
);

export default authAxios;
