// Turn an axios error into a message the user (and developer) can act on.
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  // 1. The backend answered with its own message (stock limit, invalid id, ...)
  const serverMessage = error?.response?.data?.message;
  if (serverMessage) return serverMessage;

  // 2. The backend answered, but not with our JSON (e.g. a route that doesn't exist -> HTML 404)
  if (error?.response) {
    const { status } = error.response;
    const { method, url } = error.config || {};
    return `${fallback} (server replied ${status} to ${String(method).toUpperCase()} ${url}). Is the backend restarted with the latest code?`;
  }

  // 3. No answer at all
  if (error?.request) {
    return 'Cannot reach the server. Make sure the backend is running on port 3333.';
  }

  return fallback;
};

export const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
