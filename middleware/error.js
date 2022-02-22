const winston = require("winston");
const { statusResponse } = require("../utils/tools");

module.exports = function (error, req, res, next) {
  winston.error(error.message, { metadata: error });

  res.status(500).send(statusResponse(false, `Error: ${error.message}`));
};
