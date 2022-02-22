const { statusResponse } = require("../utils/tools");
const bcrypt = require('bcrypt');
const express = require("express");
const auth = require("../middleware/auth");
const { validateVendor, Vendor } = require("../models/vendor");
const { validateItem, Item } = require("../models/item");
const { Order } = require("../models/order");
const { validateUnit, Unit } = require("../models/unit");
const router = express.Router();

router.post('/login', async (req, res) => {
  const { error } = validateVendor(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let vendor = await Vendor.findOne({ email: req.body.email });
  if (!vendor) return res.status(400).send(statusResponse(false, 'Invalid email or password.'));

  const validPassword = await bcrypt.compare(req.body.password, vendor.password);
  if (!validPassword) return res.status(400).send(statusResponse(false, 'Invalid email or password.'));

  const token = vendor.generateAuthToken();
  res.send(token);
});

router.post("/register", async (req, res) => {
  const { error } = validateVendor(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let vendor = await Vendor.findOne({ email: req.body.email });
  if (vendor) return res.status(400).send(statusResponse(false, "Vendor already registered."));

  vendor = new Vendor(req.body);
  const salt = await bcrypt.genSalt(10);
  vendor.password = await bcrypt.hash(vendor.password, salt);
  await vendor.save();

  const token = vendor.generateAuthToken();
  res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(statusResponse(true, {vendor: vendor}));
});

router.put("/profile", auth, async (req, res) => {
  const { error } = validateVendor(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let vendor = await Vendor.findOne({ _id: req.body._id });

  if (!vendor) return res.status(404).send(statusResponse(false, "Item not found!"));

  const entries = Object.keys(req.body);
  for (let i = 0; i < entries.length; i++) {
    vendor[entries[i]] = Object.values(req.body)[i];
  }

  vendor.save();

  res.send(statusResponse(true, { item: vendor }));
});

router.post("/item", auth, async (req, res) => {
  const { error } = validateItem(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  const vendor = await Vendor.findOne({ _id: req.user._id })
  let item = new Item(req.body);
  item.vendor_id = vendor._id;
  item.vendor_name = vendor.name;
  await item.save();

  res.send(statusResponse(true, {item: item}));
});

router.put("/item", auth, async (req, res) => {
  const { error } = validateItem(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let item = await Item.findOne({ _id: req.body._id });

  if (!item) return res.status(404).send(statusResponse(false, "Item not found!"));

  const entries = Object.keys(req.body);
  for (let i = 0; i < entries.length; i++) {
    item[entries[i]] = Object.values(req.body)[i];
  }

  item.save();

  res.send(statusResponse(true, { item: item }));
});

router.post("/unit", async (req, res) => {
  const { error } = validateUnit(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let unit = await Unit.findOne({ name: req.body.name });
  if (!unit) {
    unit = new Unit(req.body);
    await unit.save();
  }

  res.send(statusResponse(true, {unit: unit}));
});

router.post("/acceptOrder/:order_id", async (req, res) => {
  let order = await Order.findOne({ _id: req.params.order_id });
  order.delivery_time_planned = req.body.delivery_time_planned
  await order.save()

  res.send(statusResponse(true, "order accepted."));
});

router.post("/deliverOrder/:order_id", async (req, res) => {
  let order = await Order.findOne({ _id: req.params.order_id });
  order.delivery_time = req.body.delivery_time
  await order.save()

  res.send(statusResponse(true, "order delivered."));
});

module.exports = router;
