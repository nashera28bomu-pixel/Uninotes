// Lightweight error class carrying an HTTP status code, thrown from
// controllers/services and caught by middleware/errorHandler.js.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

module.exports = ApiError;
