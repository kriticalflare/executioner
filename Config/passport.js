const passport = require("passport");
const LocalStategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcrypt");
const User = require("./../Models/User");
const authenticateUser = (username, password, done) => {
  User.findOne({ username: username }).then(async (user) => {
    try {
      if (user != null && (await bcrypt.compare(password, user.password))) {
        return done(null, user, "Signin Sucessful");
      } else {
        return done(null, false, "Username or Password wrong");
      }
    } catch (e) {
      return done(e);
    }
  });
};
passport.use("local", new LocalStategy(authenticateUser));
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.jwtKey,
    },
    (jwtPayload, done) => {
      return User.findById(jwtPayload.id)
        .select("-password")
        .then((user) => {
          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);
