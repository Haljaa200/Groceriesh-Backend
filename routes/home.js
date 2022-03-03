const { statusResponse } = require("../utils/tools");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  return res.send(statusResponse(true, "Welcome to Groceries API."));
});

module.exports = router;
