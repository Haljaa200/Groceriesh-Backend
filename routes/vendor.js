const { statusResponse, saveFileToPublicDir } = require("../utils/tools");
const bcrypt = require('bcryptjs');
const express = require("express");
const auth = require("../middleware/auth");
const { validateVendor, Vendor } = require("../models/vendor");
const { validateItem, Item } = require("../models/item");
const { Order } = require("../models/order");
const { validateUnit, Unit } = require("../models/unit");
const { validateCategory, Category } = require("../models/category");
const router = express.Router();
const { ObjectId } = require('mongodb');
const _ = require("lodash");


// ---------- Vendor User Login, Register and Edit profile ----------

router.post('/login', async (req, res) => {
  const { error } = validateVendor(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let vendor = await Vendor.findOne({ email: req.body.email });
  if (!vendor) return res.status(400).send(statusResponse(false, 'Invalid email or password.'));

  const validPassword = await bcrypt.compare(req.body.password, vendor.password);
  if (!validPassword) return res.status(400).send(statusResponse(false, 'Invalid email or password.'));

  const token = vendor.generateAuthToken();
  res.send(statusResponse(true, {token: token, vendor: _.pick(vendor, "_id", "store_name", "owner_name", "email", "phone", "store_phone", "latitude", "longitude", "address")}));
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
  res.send(statusResponse(true, {token: token, vendor: _.pick(vendor, "_id", "store_name", "owner_name", "email", "phone", "store_phone", "latitude", "longitude", "address")}));
});

router.put("/profile", auth, async (req, res) => {
  const { error } = validateVendor(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let vendor = await Vendor.findOne({ _id: req.user._id });

  if (!vendor) return res.status(404).send(statusResponse(false, "vendor not found!"));

  const entries = Object.keys(req.body);
  for (let i = 0; i < entries.length; i++) {
    vendor[entries[i]] = Object.values(req.body)[i];
  }

  vendor.save();

  res.send(statusResponse(true, { vendor: _.pick(vendor, "_id", "store_name", "owner_name", "email", "phone", "store_phone", "latitude", "longitude", "address")}));
});




// ---------- Get, Save, edit and delete item ----------

router.get("/items", auth, async (req, res) => {
  let items = await Item.find({ vendor_id: req.user._id });
  res.send(statusResponse(true, {items: items}));
});

router.get("/item/:id", auth, async (req, res) => {
  let item = await Item.findOne({ _id: req.params.id });
  res.send(statusResponse(true, {item: item}));
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

router.put("/item/:id", auth, async (req, res) => {
  const { error } = validateItem(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let item = await Item.findOne({ _id: req.params.id });

  if (!item) return res.status(404).send(statusResponse(false, "Item not found!"));

  const entries = Object.keys(req.body);
  for (let i = 0; i < entries.length; i++) {
    item[entries[i]] = Object.values(req.body)[i];
  }

  item.save();

  res.send(statusResponse(true, { item: item }));
});

router.delete("/item/:id", auth, async (req, res) => {
  const id = ObjectId(req.params.id)
  const item = await Item.findOneAndRemove({ _id: id });

  if (!item)
    return res
      .status(404)
      .send(
        statusResponse(404, `The Item with the was not found.`)
      );

  res.send(item);
});


router.post("/item_image/:item_id", auth, async (req, res) => {
  const file = req.files.file;
  const id = ObjectId(req.params.item_id)
  let item = await Item.findOne({ _id: id });

  try {
    if (file == undefined) {
      return res.status(400).send(statusResponse(400, "File not found!"));
    }

    await saveFileToPublicDir(file);

    res
      .status(200)
      .send(
        statusResponse(true, "Uploaded the file successfully: " + file.name)
      );
  } catch (err) {
    res
      .status(500)
      .send(
        statusResponse(false, `Could not upload the file: ${file.name}. ${err}`)
      );
  }
});


// ---------- Save and delete unit ----------

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

router.delete("/unit/:id", auth, async (req, res) => {
  const id = ObjectId(req.params.id)
  const unit = await Unit.findOneAndRemove({ _id: id });

  if (!unit)
    return res
      .status(404)
      .send(
        statusResponse(404, `The Unit with the was not found.`)
      );

  res.send(unit);
});




// ---------- Save and delete category ----------

router.post("/category", async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(statusResponse(false, error.details[0].message));

  let category = await Category.findOne({ name: req.body.name });
  if (!category) {
    category = new Category(req.body);
    await category.save();
  }

  res.send(statusResponse(true, {category: category}));
});

router.delete("/category/:id", auth, async (req, res) => {
  const id = ObjectId(req.params.id)
  const category = await Category.findOneAndRemove({ _id: id });

  if (!category)
    return res
      .status(404)
      .send(
        statusResponse(404, `The Unit with the was not found.`)
      );

  res.send(category);
});


router.get("/orders", auth, async (req, res) => {
  let orders = await Order.find({vendor_id: req.user._id});
  res.send(statusResponse(true, {orders: orders}));
});

router.get("/orders/:order_id", auth, async (req, res) => {
  const id = ObjectId(req.params.order_id)
  let order = await Order.findOne({ _id: id});
  res.send(statusResponse(true, {order: order}));
});

router.post("/accept_order/:order_id", async (req, res) => {
  const id = ObjectId(req.params.order_id)
  let order = await Order.findOne({ _id: id });
  order.delivery_time_planned = req.body.delivery_time_planned
  await order.save()

  res.send(statusResponse(true, "order accepted."));
});

router.post("/deliver_order/:order_id", async (req, res) => {
  let order = await Order.findOne({ _id: req.params.order_id });
  order.delivery_time = req.body.delivery_time
  await order.save()

  res.send(statusResponse(true, "order delivered."));
});

router.get("/units", auth, async (req, res) => {
  let units = await Unit.find();
  res.send(statusResponse(true, {units: units}));
});

router.get("/categories", auth, async (req, res) => {
  let categories = await Category.find();
  res.send(statusResponse(true, {categories: categories}));
});

module.exports = router;
