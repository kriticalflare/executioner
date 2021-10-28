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
    for (const test of problem.tests) {
      let stdoutCompared = false;
      const data = submission.source;
      const buff = new Buffer.from(data, "base64");
      const text = buff.toString();

      const codeFileName = nanoid();
      const inputFileName = nanoid();
      const codePath = path.join(__dirname, "Sandbox", `${codeFileName}.js`);
      const inputPath = path.join(__dirname, "Sandbox", `${inputFileName}.txt`);
      console.log(__dirname);
      await fs.writeFile(codePath, text);
      await fs.writeFile(inputPath, test.input);

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
        console.log(`stdout: childprocess ${output}`);
        if (!(output == 0 && stdoutCompared)) {
          earlyExit = true;
        }
        fs.unlink(codePath);
        fs.unlink(inputPath);
      });
      if (earlyExit) {
        break;
      }
    }
    if (!earlyExit) {
      await Submission.findByIdAndUpdate(submission._id, {
        $set: {
          status: "ACCEPTED",
        },
      });
    }
  } catch (e) {
    console.log("err", e);
  }
});

module.exports.addToQ = (data) => {
  TestQueue.add({ submission: data });
};
