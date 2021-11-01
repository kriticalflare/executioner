const express = require("express");
const app = express();
require("dotenv").config({ path: "./.env" });
require("./passport");
const morgan = require("morgan");

/*Initialize Logging*/
if (process.env.NODE_ENV != "test") {
  app.use(morgan("dev"));
}

/*Initialize Database */
require("./database").connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
/*Auth*/
const passport = require("passport");
app.use(passport.initialize());
/*Initialize Routes */
require("./../Routes/RoutesSetup")(app);

module.exports = app;
