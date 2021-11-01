const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const baseUrl = "localhost:3000";
const request = require("supertest");
const agent = request.agent(baseUrl);
const app = require("../server");
const User = require("./../Models/User");
const bcrypt = require("bcrypt");

let token;
chai.use(chaiHttp);
describe("Tests Start", () => {
  before((done) => {
    bcrypt
      .hash("testingpassword", parseInt(process.env.Salt))
      .then((password) => {
        let user = {
          email: "test@test.com",
          username: "tester",
          password: password,
        };
        User.deleteMany().then((deleted) => {
          User.create(user).then((user) => {
            done();
          });
        });
      });
  });
  after((done) => {
    User.deleteMany().then(() => {
      done();
    });
  });
  it("Register", (done) => {
    agent
      .post("/user/register")
      .send({
        email: "register@test.com",
        username: "testname",
        password: "1234",
      })
      .end((err, res) => {
        expect(res.body.message).to.be.equal("You Have Registered Sucessfully");
        expect(res.status).to.be.equal(201);
        expect(err).to.be.equal(null);
        done();
      });
  });
  it("Register With Invalid Email", (done) => {
    agent
      .post("/user/register")
      .send({
        email: "register",
        username: "testname",
        password: "1234",
      })
      .end((err, res) => {
        expect(res.body.message).to.be.equal("Enter valid email");
        expect(res.status).to.be.equal(400);
        expect(err).to.be.equal(null);
        done();
      });
  });
  it("Register Without Email", (done) => {
    agent
      .post("/user/register")
      .send({
        username: "testname",
        password: "1234",
      })
      .end((err, res) => {
        expect(res.body.message).to.be.equal("Enter valid email");
        expect(res.status).to.be.equal(400);
        expect(err).to.be.equal(null);
        done();
      });
  });
  it("Login With Wrong Credentials", (done) => {
    agent
      .post("/user/login")
      .send({
        username: "test@test.com",
        password: "1234",
      })
      .end((err, res) => {
        expect(res.body.message).to.be.equal("Username or Password wrong");
        expect(res.body.user).to.be.equal(undefined);
        expect(res.status).to.be.equal(401);
        expect(err).to.be.equal(null);
        done();
      });
  });
  it("Login With Proper Credentials", (done) => {
    agent
      .post("/user/login")
      .send({
        username: "testname",
        password: "1234",
      })
      .end((err, res) => {
        token = res.body.token;
        expect(res.body.message).to.be.equal("Signin Sucessful");
        expect(res.body.user).not.be.equal(undefined);
        expect(res.status).to.be.equal(200);
        expect(err).to.be.equal(null);
        done();
      });
  });
  it("Login Without Username", (done) => {
    agent
      .post("/user/login")
      .send({
        password: "testingpassword",
      })
      .end((err, res) => {
        expect(res.body.message.message).to.be.equal("Missing credentials");
        expect(res.body.user).to.be.equal(undefined);
        expect(res.status).to.be.equal(401);
        expect(err).to.be.equal(null);
        done();
      });
  });
  it("Login Without Password", (done) => {
    agent
      .post("/user/login")
      .send({
        username: "test@test.com",
      })
      .end((err, res) => {
        expect(res.body.message.message).to.be.equal("Missing credentials");
        expect(res.body.user).to.be.equal(undefined);
        expect(res.status).to.be.equal(401);
        expect(err).to.be.equal(null);
        done();
      });
  });
});
