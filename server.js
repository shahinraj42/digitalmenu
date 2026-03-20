// Connect MongoDB
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://digitalmenu26:digitalmenu26@digital-menu.xx7fwu8.mongodb.net/?appName=digital-menu")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Creating Menu Model
const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String
});

const Menu = mongoose.model("Menu", menuSchema);

// Add user in backend
const adminUser = {
  username: "admin",
  password: "1234"
};

// Create Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === adminUser.username && password === adminUser.password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Get menu
app.get("/menu", async (req, res) => {
  const menu = await Menu.find();
  res.json(menu);
});


// Add new item
app.post("/menu", async (req, res) => {
  const newItem = new Menu(req.body);
  await newItem.save();

  res.json({ message: "Item added" });
});

// Delete item
app.delete("/menu/:name", (req, res) => {
  const name = req.params.name;

  menu = menu.filter(item => item.name !== name);

  res.json({ message: "Item deleted" });
});

// Update item price
app.put("/menu/:name", (req, res) => {
  const name = req.params.name;
  const item = menu.find(i => i.name === name);

  if (item) {
    item.price = req.body.price;
    res.json({ message: "Updated" });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

//Creating order model
const orderSchema = new mongoose.Schema({
  items: [String],
  table: String,
  status: String
});

const Order = mongoose.model("Order", orderSchema);

// Create order
app.post("/order", async (req, res) => {
  const newOrder = new Order({
    items: req.body.items,
    table: req.body.table,
    status: "Pending"
  });

  await newOrder.save();

  res.json({ message: "Order saved" });
});

// Send all orders (for kitchen)
app.get("/order", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});


app.put("/order/:id", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: req.body.status
  });

  res.json({ message: "Updated" });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});