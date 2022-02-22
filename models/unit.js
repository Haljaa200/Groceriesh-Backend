const Joi = require("joi");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, },
});

const Unit = mongoose.model("Unit", schema);

function validateUnit(unit) {
  const schema = Joi.object({
    name: Joi.string(),
  });

  return schema.validate(unit);
}

exports.Unit = Unit;
exports.validateUnit = validateUnit
