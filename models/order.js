const Joi = require("joi");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  customer_id: { type: Number, },
  delivery_latitude: { type: Number, },
  delivery_longitude: { type: Number, },
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
  delivery_address: { type: Number, },
  delivery_time_planned: { type: Number, },
  delivery_time: { type: Number, },
  notes: { type: Number, },
});

const Order = mongoose.model("Order", schema);

function validateOrder(order) {
  const schema = Joi.object({
    item_id: Joi.number(),
    quantity: Joi.number(),
    total_price: Joi.number(),
  });

  return schema.validate(order);
}

exports.Order = Order;
exports.validateOrder = validateOrder;
