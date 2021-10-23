exports.userVerification = (req, res, next) => {
  if (req.user.isVerified) {
    next();
  } else {
    res.status(403).json({ message: "Please verify your email first" });
  }
};
