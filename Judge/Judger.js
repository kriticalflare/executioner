const Problem = require("../Models/Problem");
const Queue = require("bull");
const TestQueue = new Queue("submit", process.env.REDIS_URL);
const { spawn } = require("child_process");
const { promises: fs } = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
const Submission = require("../Models/Submission");

TestQueue.process(async (job) => {
  try {
    const submission = job.data.submission;
    const problem = await Problem.findById(submission.problem);
    let earlyExit = false;
    const testCount = problem.tests.length;
    let testsCompleted = 0;
    for (const test of problem.tests) {
      let stdoutCompared = false;
      const data = submission.source;
      const buff = new Buffer.from(data, "base64");
      const text = buff.toString();

      const codeFileName = nanoid();
      const codePath = path.join(__dirname, "Sandbox", `${codeFileName}.js`);

      await fs.writeFile(codePath, text);

      const childprocess = spawn("node", [codePath]);

      childprocess.stdin.write(test.input);
      childprocess.stdin.end();

      childprocess.stdout.on("data", async (output) => {
        if (!(output.toString().trim() == test.output)) {
          earlyExit = true;
          await Submission.findByIdAndUpdate(submission._id, {
            $set: {
              status: "WA",
              output: Buffer.from(output).toString("base64"),
            },
          });
        }
        stdoutCompared = true;
      });

      childprocess.stderr.on("data", async (output) => {
        await Submission.findByIdAndUpdate(submission._id, {
          $set: {
            status: "NZEC",
            output: Buffer.from(output).toString("base64"),
          },
        });
        earlyExit = true;
      });

      childprocess.on("close", async (output) => {
        if (!(output == 0 && stdoutCompared)) {
          earlyExit = true;
        }
        fs.unlink(codePath);
        testsCompleted = testsCompleted + 1;
        if (testsCompleted == testCount && !earlyExit) {
          await Submission.findByIdAndUpdate(submission._id, {
            $set: {
              status: "ACCEPTED",
            },
          });
        }
      });
    }
  } catch (e) {
    await Submission.findByIdAndUpdate(job.data.submission._id, {
      $set: {
        status: "FAILED",
      },
    });
    const folderPath = path.normalize(path.join(__dirname, "Sandbox"));
    let files = await fs.readdir(folderPath);
    files = files.filter((f) => !f.includes(".gitignore"));
    Promise.all(files.map((f) => fs.unlink(path.join(folderPath, f))));
  }
});

module.exports.addToQ = (data) => {
  TestQueue.add({ submission: data });
};
