const { statusResponse } = require("../utils/tools");
const bcrypt = require('bcrypt');
const express = require("express");
const auth = require("../middleware/auth");
const { validateCustomer, Customer } = require("../models/customer");
const { validateOrder, Order } = require("../models/order");
const {Item} = require("../models/item");
const router = express.Router();

router.post('/login', async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let customer = await Customer.findOne({ email: req.body.email });
  if (!customer) return res.status(400).send(statusResponse(false, 'Invalid email or password.'));

  const validPassword = await bcrypt.compare(req.body.password, customer.password);
  if (!validPassword) return res.status(400).send(statusResponse(false, 'Invalid email or password.'));

  const token = customer.generateAuthToken();
  res.send(token);
});

router.post("/register", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let customer = await Customer.findOne({ email: req.body.email });
  if (customer) return res.status(400).send(statusResponse(false, "Customer already registered."));

  customer = new Customer(req.body);
  const salt = await bcrypt.genSalt(10);
  customer.password = await bcrypt.hash(customer.password, salt);
  await customer.save();

  const token = customer.generateAuthToken();
  res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(statusResponse(true, {customer: customer}));
});

router.put("/profile", auth, async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let customer = await Customer.findOne({ _id: req.body._id });

  if (!customer) return res.status(404).send(statusResponse(false, "Customer not found!"));

  const entries = Object.keys(req.body);
  for (let i = 0; i < entries.length; i++) {
    customer[entries[i]] = Object.values(req.body)[i];
  }

  customer.save();

  res.send(statusResponse(true, { item: customer }));
});

router.get("/items", auth, async (req, res) => {
  let items = await Item.find();
  res.send(statusResponse(true, {items: items}));
});

router.get("/items/:vendor_id", auth, async (req, res) => {
  let items = await Item.find({ vendor_id: req.params.vendor_id});
  res.send(statusResponse(true, {items: items}));
});

router.post("/order", async (req, res) => {
  const { error } = validateOrder(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let order = new Order(req.body);
  await order.save();

  res.send(statusResponse(true, {order: order}));
});

module.exports = router;
