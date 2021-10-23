const Jwt = require("jsonwebtoken");

exports.createToken = (payload) => {
  return new Promise((resolve, reject) => {
    Jwt.sign(payload, process.env.jwtKey, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    Jwt.verify(token, process.env.jwtKey, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};
