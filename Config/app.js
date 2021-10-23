const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config({ path: "./.env" });
require("./passport");

/*Initilize Database */

require("./database").connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
/*Auth*/
const passport = require("passport");
app.use(passport.initialize());
/*Initilize Routes */
require("./../Routes/RoutesSetup")(app);

module.exports = app;
