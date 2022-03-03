const cors = require("cors");
const express = require("express");
const expressFileUpload = require("express-fileupload");
const home = require("../routes/home");
const customer = require("../routes/customer");
const vendor = require("../routes/vendor");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(expressFileUpload({}));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static("public"));
  app.use(cors());
  app.use("/", home);
  app.use("/customer", customer); // https:groceries.software/customer
  app.use("/vendor", vendor); // https:groceries.software/vendor
  app.use(error);
};


// request -> function of that request -> return response to user
// request -> middleware -> function of that request -> return response to use
