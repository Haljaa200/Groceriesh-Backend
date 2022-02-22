require("winston-mongodb");
require("express-async-errors");
const winston = require("winston");

module.exports = function () {
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  winston.add(
    new winston.transports.MongoDB({
      db: process.env.DB_URL,
      options: {
        useUnifiedTopology: true,
      },
    })
  );

  winston.exceptions.handle(
    new winston.transports.MongoDB({
      db: process.env.DB_URL,
      options: {
        useUnifiedTopology: true,
      },
    }),
    new winston.transports.Console()
  );
};
