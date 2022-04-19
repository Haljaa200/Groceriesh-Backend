const Joi = require("joi");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  vendor_id: { type: String, },
  vendor_name: { type: String },
  category_id: { type: String, },
  name: { type: String, },
  price: { type: Number, },
  photo: { type: String, },
  unit: { type: String, },
  description: { type: String, },
});

const Item = mongoose.model("Item", schema);

function validateItem(item) {
  const schema = Joi.object({
    vendor_id: Joi.string().allow(''),
    vendor_name: Joi.string().allow(''),
    category_id: Joi.string(),
    name: Joi.string(),
    price: Joi.number(),
    photo: Joi.string(),
    unit: Joi.string(),
    description: Joi.string(),
  });

  return schema.validate(item);
}

exports.Item = Item;
exports.validateItem = validateItem;
