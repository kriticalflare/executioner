const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports.connect = () => {
  new Promise(async (resolve, reject) => {
    if (process.env.NODE_ENV == "test") {
      console.log("TEST");
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri(), {
        dbName: "executioner",
      });
    } else {
      let DBstring = "";
      if (process.env.NODE_ENV == "prod") DBstring = process.env.PROD_DATABASE;
      else DBstring = process.env.DEV_DATABASE;

      mongoose
        .connect(DBstring)
        .then(() => {
          if (process.env.NODE_ENV != "test" && process.env.NODE_ENV != "prod")
            console.log("Connection to database sucessful");
          resolve();
        })
        .catch((err) => {
          if ((process.env.NODE_ENV = "test" && process.env.NODE_ENV != "prod"))
            console.log("Connection Failed " + err);
          reject();
        });
    }
  });
};
module.exports.close = () => {
  new Promise((resolve, reject) => {
    mongoose
      .disconnect()
      .then((conn) => {
        if (process.env.NODE_ENV != "test" && process.env.NODE_ENV != "prod")
          console.log("Connection Closed");
        resolve();
      })
      .catch((err) => {
        if (process.env.NODE_ENV != "test" && process.env.NODE_ENV != "prod")
          console.log("Connection Failed to Close " + err);
        reject();
      });
  });
};
