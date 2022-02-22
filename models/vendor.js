const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  store_name: { type: String, },
  owner_name: { type: String, },
  email: { type: String, },
  phone: { type: String, },
  store_phone: { type: String, },
  password: { type: String, },
  longitude: { type: Number, },
  latitude: { type: Number, },
  address: { type: String, },
});

schema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_PRIVATE_KEY
  );
};

const Vendor = mongoose.model("Vendor", schema);

function validateVendor(vendor) {
  const schema = Joi.object({
    store_name: Joi.string(),
    owner_name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    store_phone: Joi.string(),
    password: Joi.string(),
    longitude: Joi.number(),
    latitude: Joi.number(),
    address: Joi.string(),
  });

  return schema.validate(vendor);
}

exports.Vendor = Vendor;
exports.validateVendor = validateVendor;
