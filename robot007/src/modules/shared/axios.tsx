import Axios from 'axios';

// Central server URL — kept in sync with the socket URL in Generate.tsx
export const SERVER_URL = 'http://162.0.230.49:8087';
const BASE_URL = `${SERVER_URL}/api`;

interface RetryConfig {
  _retryCount?: number;
}

const authAxios = Axios.create({
  baseURL: BASE_URL,
  // No global timeout. Long-running requests (verification, bulk send) can take
  // several minutes. Per-request callers may set their own timeout via config.
  // timeout: 0
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

// ── Retry policy ──────────────────────────────────────────────────────────────
// Only retry on specific HTTP 5xx / 429 server errors.
// NEVER retry on:
//   • Network timeouts (ECONNABORTED / ETIMEDOUT)
//     — verification sends ALL numbers in one HTTP POST that runs for minutes;
//       retrying would restart verification from scratch and produce fake progress.
//   • Cancelled requests
// ─────────────────────────────────────────────────────────────────────────────
const MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

authAxios.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const config: RetryConfig & typeof error.config = error.config;
    if (!config) return Promise.reject(error);

    // Classify error
    const isTimeout =
      error?.code === 'ECONNABORTED' ||
      error?.code === 'ETIMEDOUT'    ||
      error?.message?.toLowerCase().includes('timeout');

    const httpStatus: number | undefined = error.response?.status;

    // Retry ONLY on real server-side HTTP errors, never on timeouts/network errors
    const shouldRetry =
      !isTimeout &&
      !Axios.isCancel(error) &&
      (config._retryCount ?? 0) < MAX_RETRIES &&
      !!httpStatus &&
      RETRYABLE_STATUS.has(httpStatus);

    if (shouldRetry) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      const backoffMs = Math.min(1000 * 2 ** (config._retryCount - 1), 8000);
      await new Promise<void>((resolve) => setTimeout(resolve, backoffMs));
      return authAxios(config);
    }

    if (!Axios.isCancel(error)) {
      const msg = error.response?.data?.message || error.message;
      console.error(`[API] ${httpStatus ?? error.code ?? 'NET'} ${config.url} — ${msg}`);
    }

    return Promise.reject(error);
  }
);

export default authAxios;
