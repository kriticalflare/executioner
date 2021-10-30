const handleDuplicateKeyError = (err, res) => {
  const field = Object.keys(err.keyValue);
  const error = `An account with that ${field} already exists.`;
  res.status(400).json({
    message: error,
  });
};
const handleValidationError = (err, res) => {
  let error = Object.values(err.errors).map((el) => el.path);
  if (error.length > 1) {
    error = error.join(",");
  }
  error = "Enter valid " + error;
  res.status(400).json({
    message: error,
  });
};

module.exports.NotFoundHandler = (req, res, next) => {
  const err = new Error("Page Not Found");
  err.status = "fail";
  err.statusCode = 404;
  err.message = "Page Not Found";
  res.status(err.statusCode).json({
    message: err.message,
  });
};

module.exports.ErrorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError")
    return (err = handleValidationError(err, res));
  else if (err.code && err.code == 11000)
    return (err = handleDuplicateKeyError(err, res));
  else
    res.status(err.statusCode || 500).json({
      message: err.message,
    });
};
