const express = require("express");
const cors = require("cors");

// ========================
// MULTER SETUP FOR IMAGE UPLOAD
// ========================
const multer = require("multer");

// This sets where uploaded images are stored
const storage = multer.diskStorage({
  destination: "uploads/", // folder where images will be saved
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // unique filename
  }
});

const upload = multer({ storage });


const app = express();

// ========================
// SERVE UPLOADED IMAGES
// ========================
app.use("/uploads", express.static("uploads")); // makes uploaded images accessible via URL

// Connect MongoDB
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://digitalmenu26:digitalmenu26@digital-menu.xx7fwu8.mongodb.net/?appName=digital-menu")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ ERROR:", err));



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

// ========================
// UPLOAD IMAGE ROUTE
// ========================
app.post("/upload", upload.single("image"), (req, res) => {
  // Returns URL of uploaded image
  res.json({
    imageUrl: `https://digitalmenu-bo8l.onrender.com/uploads/${req.file.filename}` // change your backend URL if different
  });
});


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

// Add DELETE API
app.delete("/menu/:id", async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// Add UPDATE API
app.put("/menu/:id", async (req, res) => {

  if (!req.body.price) {
    return res.status(400).json({ message: "Price required" });
  }
  await Menu.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Updated" });
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