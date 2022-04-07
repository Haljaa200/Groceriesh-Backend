const { statusResponse } = require("../utils/tools");
const bcrypt = require('bcryptjs');
const express = require("express");
const auth = require("../middleware/auth");
const { validateCustomer, Customer } = require("../models/customer");
const { validateOrder, Order } = require("../models/order");
const { Category } = require("../models/category");
const { Item } = require("../models/item");
const { Vendor } = require("../models/vendor");
const router = express.Router();
const _ = require("lodash");
const { ObjectId } = require('mongodb');

// ---------- Customer User Login, Register and Edit profile ----------

router.post('/login', async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let customer = await Customer.findOne({ email: req.body.email });
  if (!customer) return res.status(200).send(statusResponse(false, 'Invalid email or password.'));

  const validPassword = await bcrypt.compare(req.body.password, customer.password);
  if (!validPassword) return res.status(200).send(statusResponse(false, 'Invalid email or password.'));

  const token = customer.generateAuthToken();
  res.send(statusResponse(true, {token: token, customer: _.pick(customer, "_id", "first_name", "last_name", "delivery_address", "email", "latitude", "longitude", "phone")}));
});

router.post("/register", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let customer = await Customer.findOne({ email: req.body.email });
  if (customer) return res.status(200).send(statusResponse(false, "Customer already registered."));

  customer = new Customer(req.body);
  const salt = await bcrypt.genSalt(10);
  customer.password = await bcrypt.hash(customer.password, salt);
  await customer.save();

  const token = customer.generateAuthToken();
  res.send(statusResponse(true, {token: token, customer: _.pick(customer, "_id", "first_name", "last_name", "delivery_address", "email", "latitude", "longitude", "phone")}));
});

router.put("/profile", auth, async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let customer = await Customer.findOne({ _id: req.user._id });

  if (!customer) return res.status(404).send(statusResponse(false, "Customer not found!"));

  const entries = Object.keys(req.body);
  for (let i = 0; i < entries.length; i++) {
    customer[entries[i]] = Object.values(req.body)[i];
  }

  customer.save();

  res.send(statusResponse(true, { customer: _.pick(customer, "_id", "first_name", "last_name", "delivery_address", "email", "latitude", "longitude", "phone")}));
});



router.get("/items", auth, async (req, res) => {
  let items = await Item.find();
  res.send(statusResponse(true, {items: items}));
});

router.get("/vendor_items/:vendor_id/:category_id", auth, async (req, res) => {
  const id = ObjectId(req.params.vendor_id)
  let items;
  if (req.params.category_id !== "0") {
    items = await Item.find({ vendor_id: id, category_id: req.params.category_id });
  } else {
    items = await Item.find({ vendor_id: id });
  }
  res.send(statusResponse(true, {items: items}));
});

router.get("/category_items/:category_id", auth, async (req, res) => {
  const id = ObjectId(req.params.category_id)
  let items = await Item.find({ category_id: id});
  res.send(statusResponse(true, {items: items}));
});

router.get("/vendors", auth, async (req, res) => {
  let vendors = await Vendor.find();
  res.send(statusResponse(true, {vendors: _.map(vendors, row => _.pick(row, "_id", "store_name", "store_phone", "longitude", "latitude", "address"))}));
});

router.post("/order", async (req, res) => {
  const { error } = validateOrder(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let order = new Order(req.body);
  await order.save();

  res.send(statusResponse(true, {order: order}));
});

router.get("/categories", auth, async (req, res) => {
  let categories = await Category.find();
  res.send(statusResponse(true, {categories: categories}));
});

module.exports = router;
