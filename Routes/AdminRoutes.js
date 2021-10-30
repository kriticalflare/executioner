const express = require("express");
const passport = require("passport");
const { userVerification } = require("../Middleware/UserVerification");
const { adminVerification } = require("../Middleware/AdminVerification");
const AdminController = require("../Controller/Admin");
const AdminRoutes = express.Router();

AdminRoutes.use(passport.authenticate("jwt", { session: false }));
AdminRoutes.use(userVerification);
AdminRoutes.use(adminVerification);

AdminRoutes.patch("/promote", AdminController.PromoteToAdmin);

module.exports = AdminRoutes;
