const Joi = require("joi");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, },
});

const Category = mongoose.model("Category", schema);

function validateCategory(category) {
  const schema = Joi.object({
    name: Joi.string(),
  });

  return schema.validate(category);
}

exports.Category = Category;
exports.validateCategory = validateCategory
