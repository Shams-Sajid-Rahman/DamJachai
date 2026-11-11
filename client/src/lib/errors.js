/**
 * Reads a readable, translated message from an Axios error.
 * Known error codes from the API (e.g. INVALID_CREDENTIALS) are translated from errors.codes.*.
 * Otherwise the server message is shown.
 */
export function getErrorMessage(error, t) {
  const tr = (key, fallback, options) => (t ? t(key, { defaultValue: fallback, ...options }) : fallback);

  if (!error) return tr('errors.generic', 'Something went wrong. Please try again.');
  if (error.code === 'ECONNABORTED') return tr('errors.timeout', 'The request timed out. Please try again.');
  if (!error.response) return tr('errors.network', 'Cannot reach the server. Check your connection.');

  const { status } = error.response;
  const apiError = error.response.data?.error || {};
  if (status === 429) return tr('errors.rateLimited', apiError.message || 'Too many requests. Please wait a moment.');
  if (apiError.code) return tr(`errors.codes.${apiError.code}`, apiError.message || 'Request failed');
  if (status === 403) return tr('errors.forbidden', apiError.message || 'You do not have permission to do this.');
  if (status === 404) return tr('errors.notFound', apiError.message || 'Not found.');
  return apiError.message || tr('errors.generic', 'Something went wrong. Please try again.');
}

/** Field errors from a 400 validation response, e.g. { email: 'Enter a valid email address' }. */
export function getFieldErrors(error) {
  const details = error?.response?.data?.error?.details;
  if (!details || typeof details !== 'object' || Array.isArray(details)) return {};
  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)]),
  );
}

export const getErrorCode = (error) => error?.response?.data?.error?.code;
export const getStatus = (error) => error?.response?.status;
