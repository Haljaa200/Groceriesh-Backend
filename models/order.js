const Joi = require("joi");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  customer_id: { type: String, },
  vendor_id: {  type: String },
  delivery_latitude: { type: Number, },
  delivery_longitude: { type: Number, },
  delivery_address: { type: String, },
  items: [
    {
      name: { type: String, },
      price: { type: Number, },
      photo: { type: String, },
      unit: { type: String, },
      quantity: { type: Number, },
    }
  ],
  total_price: { type: Number, },
  delivery_time_planned: { type: Number, },
  delivered: { type: Boolean, default: false },
  notes: { type: String, },
});

const Order = mongoose.model("Order", schema);

function validateOrder(order) {
  const schema = Joi.object({
    customer_id: Joi.string(),
    vendor_id: Joi.string(),
    delivery_latitude: Joi.number(),
    delivery_longitude: Joi.number(),
    delivery_address: Joi.string(),
    items: Joi.array().items(
      Joi.object().keys({
        name: Joi.string(),
        price: Joi.number(),
        photo: Joi.number(),
        unit: Joi.string(),
        quantity: Joi.number(),
      })
    ),
    total_price: Joi.number(),
    delivery_time_planned: Joi.number(),
    delivered: Joi.boolean(),
    notes: Joi.string().allow(''),
  });

  return schema.validate(order);
}

exports.Order = Order;
exports.validateOrder = validateOrder;
