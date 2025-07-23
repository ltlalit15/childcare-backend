export const sendResponse = (res, status, message, data = {}) => {
  return res.status(status).json({
    status,
    message,
    data,
  });
};

export const sendError = (res, status = 500, error = "Something went wrong", errorDetails = {}) => {
  return res.status(status).json({
    success: false,
    status,
    message: error,
    error: errorDetails,
  });
};