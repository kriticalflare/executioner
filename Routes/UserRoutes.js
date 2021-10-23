const express = require("express");
const passport = require("passport");
const UserController = require("../Controller/User");
const UserRoutes = express.Router();

UserRoutes.post("/register", UserController.Register);
UserRoutes.get("/verify", UserController.Verify);
UserRoutes.post("/login", UserController.Login);

UserRoutes.use(passport.authenticate("jwt", { session: false }));

module.exports = UserRoutes;
