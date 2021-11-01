const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const baseUrl = "localhost:3000";
const request = require("supertest");
const agent = request.agent(baseUrl);
const app = require("../server");
const User = require("./../Models/User");
const bcrypt = require("bcrypt");
const Problem = require("../Models/Problem");

let token, userId, probId, subId;
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
        userId = res.body.user._id;
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
  describe("Hit apis without verification", () => {
    it("Create a Problem without verifying mail", (done) => {
      agent
        .put("/problem/create")
        .auth(token, { type: "bearer" })
        .send({
          title: "Armstrong Number",
          description:
            "Armstrong number is a number that is equal to the sum of cubes of its digits. Take the input and output the true if it is an Armstrong number, false if it is not.",
          tests: [
            {
              input: "0",
              output: "true",
            },
            {
              input: "153",
              output: "true",
            },
            {
              input: "242",
              output: "false",
            },
          ],
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal(
            "Please verify your email first"
          );
          expect(res.status).to.be.equal(403);
          expect(err).to.be.equal(null);
          done();
        });
    });
  });
  let testUserId;
  describe("Access APIs that require Admin access without ADMIN role but verified account", () => {
    before(async () => {
      await User.findByIdAndUpdate(userId, {
        $set: {
          isVerified: true,
        },
      });
      await User.findOneAndDelete({ email: "abc@example.com" });
      let createdUser = await User.create({
        username: "abc",
        password: "pass",
        email: "abc@example.com",
      });
      testUserId = createdUser._id;
    });

    after(async () => {
      await User.findOneAndDelete({ email: "abc@example.com" });
    });

    it("Create a Problem", (done) => {
      agent
        .post("/problem/create")
        .auth(token, { type: "bearer" })
        .send({
          title: "Armstrong Number",
          description:
            "Armstrong number is a number that is equal to the sum of cubes of its digits. Take the input and output the true if it is an Armstrong number, false if it is not.",
          tests: [
            {
              input: "0",
              output: "true",
            },
            {
              input: "153",
              output: "true",
            },
            {
              input: "242",
              output: "false",
            },
          ],
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Access Forbidden");
          expect(res.status).to.be.equal(403);
          expect(err).to.be.equal(null);
          done();
        });
    });

    it("Promote to admin", (done) => {
      agent
        .patch("/admin/promote")
        .auth(token, { type: "bearer" })
        .send({
          user_id: testUserId,
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Access Forbidden");
          expect(res.status).to.be.equal(403);
          expect(err).to.be.equal(null);
          done();
        });
    });

    it("Demote from admin", (done) => {
      agent
        .patch("/admin/demote")
        .auth(token, { type: "bearer" })
        .send({
          user_id: testUserId,
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Access Forbidden");
          expect(res.status).to.be.equal(403);
          expect(err).to.be.equal(null);
          done();
        });
    });
  });

  describe("Access APIs that require Admin access with ADMIN role and verified account", () => {
    before(async () => {
      await User.findByIdAndUpdate(userId, {
        $set: {
          isVerified: true,
          role: "ADMIN",
        },
      });
      let createdUser = await User.create({
        username: "abc",
        password: "pass",
        email: "abc@example.com",
      });
      testUserId = createdUser._id;
    });

    after(async () => {
      await User.findOneAndDelete({ email: "abc@example.com" });
      await Problem.deleteMany();
    });

    it("Create a Problem", (done) => {
      agent
        .put("/problem/create")
        .auth(token, { type: "bearer" })
        .send({
          title: "Armstrong Number",
          description:
            "Armstrong number is a number that is equal to the sum of cubes of its digits. Take the input and output the true if it is an Armstrong number, false if it is not.",
          tests: [
            {
              input: "0",
              output: "true",
            },
            {
              input: "153",
              output: "true",
            },
            {
              input: "242",
              output: "false",
            },
          ],
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Successful");
          expect(res.body.data).to.be.not.empty;
          expect(res.body.data._id).to.be.not.empty;
          expect(res.status).to.be.equal(201);
          expect(err).to.be.equal(null);
          done();
        });
    });

    it("Promote to admin an account that exists", (done) => {
      agent
        .patch("/admin/promote")
        .auth(token, { type: "bearer" })
        .send({
          user_id: testUserId,
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal(
            "User has been promoted to admin"
          );
          expect(res.status).to.be.equal(201);
          expect(err).to.be.equal(null);
          done();
        });
    });
    it("Promote to admin an account that doesn't exists", (done) => {
      agent
        .patch("/admin/promote")
        .auth(token, { type: "bearer" })
        .send({
          user_id: "617aa9c0068dd501840a1262",
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Unsuccessful");
          expect(res.status).to.be.equal(400);
          expect(err).to.be.equal(null);
          done();
        });
    });

    it("Demote from admin", (done) => {
      agent
        .patch("/admin/demote")
        .auth(token, { type: "bearer" })
        .send({
          user_id: testUserId,
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal(
            "User has been demoted from admin"
          );
          expect(res.status).to.be.equal(201);
          expect(err).to.be.equal(null);
          done();
        });
    });
    it("Demote from admin an account that doesnt exist", (done) => {
      agent
        .patch("/admin/demote")
        .auth(token, { type: "bearer" })
        .send({
          user_id: "617aa9c0068dd501840a1262",
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Unsuccessful");
          expect(res.status).to.be.equal(400);
          expect(err).to.be.equal(null);
          done();
        });
    });
  });

  describe("Problems API", () => {
    before(async () => {
      await User.findByIdAndUpdate(userId, {
        $set: {
          isVerified: true,
          role: "ADMIN",
        },
      });
    });

    it("Create a Problem", (done) => {
      agent
        .put("/problem/create")
        .auth(token, { type: "bearer" })
        .send({
          title: "Armstrong Number",
          description:
            "Armstrong number is a number that is equal to the sum of cubes of its digits. Take the input and output the true if it is an Armstrong number, false if it is not.",
          tests: [
            {
              input: "0",
              output: "YES",
            },
            {
              input: "153",
              output: "YES",
            },
            {
              input: "242",
              output: "NO",
            },
          ],
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Successful");
          expect(res.body.data).to.be.not.empty;
          expect(res.body.data._id).to.be.not.empty;
          probId = res.body.data._id;
          expect(res.status).to.be.equal(201);
          expect(err).to.be.equal(null);
          done();
        });
    });

    it("Get all problems", (done) => {
      agent
        .get("/problem/dashboard")
        .auth(token, { type: "bearer" })
        .send()
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Successful");
          expect(res.status).to.be.equal(200);
          expect(res.body.data).to.be.not.empty;
          expect(err).to.be.equal(null);
          done();
        });
    });
    it("View a problem", (done) => {
      agent
        .get(`/problem/id/${probId}`)
        .auth(token, { type: "bearer" })
        .send()
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Successful");
          expect(res.status).to.be.equal(200);
          expect(res.body.data).to.be.not.empty;
          expect(err).to.be.equal(null);
          done();
        });
    });
  });
  let correctSub, incorrectSub;
  describe("Submissions API", () => {
    before(async () => {
      await User.findByIdAndUpdate(userId, {
        $set: {
          isVerified: true,
          role: "ADMIN",
        },
      });
    });

    it("Create a Submission with correct code", (done) => {
      agent
        .put("/submission/create")
        .auth(token, { type: "bearer" })
        .send({
          source:
            "Y29uc3QgcmVhZExpbmUgPSByZXF1aXJlKCJyZWFkbGluZSIpOwoKdmFyIHJsID0gcmVhZExpbmUuY3JlYXRlSW50ZXJmYWNlKHByb2Nlc3Muc3RkaW4sIHByb2Nlc3Muc3Rkb3V0KTsKCnJsLm9uKCJsaW5lIiwgKGlucHV0KSA9PiB7CiAgbGV0IHN1bSA9IDA7CiAgbGV0IHRlbXAgPSBpbnB1dDsKICB3aGlsZSAodGVtcCA+IDApIHsKICAgIGNvbnN0IHJlbSA9IE1hdGguZmxvb3IodGVtcCAlIDEwKTsKICAgIHN1bSA9IHN1bSArIE1hdGgucG93KHJlbSwgMyk7CiAgICB0ZW1wID0gdGVtcCAvIDEwOwogIH0KICBpZiAoc3VtID09IGlucHV0KSB7CiAgICBjb25zb2xlLmxvZygiWUVTIik7CiAgfSBlbHNlIHsKICAgIGNvbnNvbGUubG9nKCJOTyIpOwogIH0KICBybC5jbG9zZSgpOwp9KTsK",
          problem: probId,
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Successful");
          expect(res.body.data).to.be.not.empty;
          expect(res.body.data._id).to.be.not.empty;
          correctSub = res.body.data._id;
          expect(res.status).to.be.equal(201);
          expect(res.body.data.status).to.be.equal("QUEUED");
          expect(err).to.be.equal(null);
          done();
        });
    });

    it("Create a Submission with incorrect code", (done) => {
      agent
        .put("/submission/create")
        .auth(token, { type: "bearer" })
        .send({
          source:
            "Y29uc3QgcmVhZExpbmUgPSByZXF1aXJlKCJyZWFkbGluZSIpOwoKdmFyIHJsID0gcmVhZExpbmUuY3JlYXRlSW50ZXJmYWNlKHByb2Nlc3Muc3RkaW4sIHByb2Nlc3Muc3Rkb3V0KTsKCnJsLm9uKCJsaW5lIiwgKGlucHV0KSA9PiB7CiAgbGV0IHN1bSA9IDA7CiAgbGV0IHRlbXAgPSBpbnB1dDsKICB3aGlsZSAodGVtcCA+IDApIHsKICAgIGNvbnN0IHJlbSA9IE1hdGguZmxvb3IodGVtcCAlIDEwKTsKICAgIHN1bSA9IHN1bSArIE1hdGgucG93KHJlbSwgMyk7CiAgICB0ZW1wID0gdGVtcCAvIDEwOwogIH0KICBpZiAoc3VtICE9IGlucHV0KSB7CiAgICBjb25zb2xlLmxvZygiWUVTIik7CiAgfSBlbHNlIHsKICAgIGNvbnNvbGUubG9nKCJOTyIpOwogIH0KICBybC5jbG9zZSgpOwp9KTsK",
          problem: probId,
        })
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Successful");
          expect(res.body.data).to.be.not.empty;
          expect(res.body.data._id).to.be.not.empty;
          incorrectSub = res.body.data._id;
          expect(res.status).to.be.equal(201);
          expect(res.body.data.status).to.be.equal("QUEUED");
          expect(err).to.be.equal(null);
          done();
        });
    });

    it("Get all submissions", (done) => {
      agent
        .get("/submission/allSubmissions")
        .auth(token, { type: "bearer" })
        .send()
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Successful");
          expect(res.status).to.be.equal(200);
          expect(res.body.data).to.be.not.empty;
          expect(err).to.be.equal(null);
          done();
        });
    });
    it("View the correct submission", (done) => {
      agent
        .get(`/submission/${correctSub}`)
        .auth(token, { type: "bearer" })
        .send()
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Successful");
          expect(res.status).to.be.equal(200);
          expect(res.body.data).to.be.not.empty;
          expect(res.body.data.status).to.be.equal("ACCEPTED");
          expect(err).to.be.equal(null);
          done();
        });
    });
    it("View the incorrect submission", (done) => {
      agent
        .get(`/submission/${incorrectSub}`)
        .auth(token, { type: "bearer" })
        .send()
        .end((err, res) => {
          expect(res.body.message).to.be.equal("Successful");
          expect(res.status).to.be.equal(200);
          expect(res.body.data).to.be.not.empty;
          expect(res.body.data.status).to.be.equal("WA");
          expect(err).to.be.equal(null);
          done();
        });
    });
  });
});
