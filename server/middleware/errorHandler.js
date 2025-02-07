const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    code: 500,
    message: 'Internal server error'
  })
}

module.exports = errorHandlerMiddleware;