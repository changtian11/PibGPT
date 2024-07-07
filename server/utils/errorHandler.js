export default function createApiError(message, statusCode, errorCode, details) {
  return {
    message,
    statusCode,
    errorCode,
    details,
  };
}