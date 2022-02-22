const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  first_name: { type: String, },
  last_name: { type: String, },
  email: { type: String, },
  phone: { type: String, },
  password: { type: String, },
  longitude: { type: Number, },
  latitude: { type: Number, },
  delivery_address: { type: String, },
});

schema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_PRIVATE_KEY
  );
};

const Customer = mongoose.model("Customer", schema);

function validateCustomer(customer) {
  const schema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    password: Joi.string(),
    longitude: Joi.number(),
    latitude: Joi.number(),
    delivery_address: Joi.string(),
  });

  return schema.validate(customer);
}

exports.Customer = Customer;
exports.validateCustomer = validateCustomer;
