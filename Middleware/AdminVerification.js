module.exports.adminVerification = (req, res, next) => {
  if (req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Access Forbidden" });
  }
};
