export function handleError(error, res) {
  console.error('API Error:', error);

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}

export function createErrorResponse(status, message, details = null) {
  const response = {
    success: false,
    error: message
  };

  if (details) {
    response.details = details;
  }

  return { status, response };
}