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
const mongoose = require("mongoose"); // import mongoose (used to create schema)
mongoose.connect("mongodb+srv://digitalmenu26:digitalmenu26@digital-menu.xx7fwu8.mongodb.net/?appName=digital-menu")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ ERROR:", err));



app.use(cors());
app.use(express.json());


// ========================
// 🟢 RESTAURANT MODEL (Database Structure)
// ========================
const restaurantSchema = new mongoose.Schema({                    // create structure for restaurant
  name: String,                                                   // restaurant name (e.g., "Raz Restaurant")
  email: String,                                                  // login email
  password: String                                                // login password
});
const Restaurant = mongoose.model("Restaurant", restaurantSchema); // create model (table-like)




// Creating Menu Model
const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  restaurantId: String   // 🔥 IMPORTANT
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


// ========================
// 🔵 RESTAURANT LOGIN API (Database Based)
// ========================

app.post("/login", async (req, res) => {            // create POST API for login
  const { email, password } = req.body;             // get email & password from frontend

  const restaurant = await Restaurant.findOne({     // search in database
    email: email,                                   // match email
    password: password                              // match password
  });

  if (restaurant) {                                 // if restaurant found
    res.json({
      success: true,                                // login success
      restaurantId: restaurant._id                  // send unique ID to frontend (VERY IMPORTANT)
    });
  } else {                                          // if not found
    res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }
});



// ========================
// 🟡 GET MENU BY restaurantId
// FILE: server.js
// ========================

app.get("/menu", async (req, res) => {

  const { restaurantId } = req.query; 
  // get restaurantId from URL query

  const menu = await Menu.find({ restaurantId: restaurantId }); 
  // find ONLY items for this restaurant

  res.json(menu); 
  // send filtered menu back to frontend

});


// Add new item
app.post("/menu", async (req, res) => {
    try {
        // 1. Get the data sent from the phone
        const { name, price, image, restaurantId } = req.body;

        // 2. Create the item and ATTACH the restaurantId
        const newItem = new MenuItem({ 
            name, 
            price, 
            image, 
            restaurantId  // <--- This MUST be here to link the food to your restaurant
        });

        await newItem.save();
        res.json({ success: true, message: "Item added!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});



// ✅ SECURE DELETE API
app.delete("/menu/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    // We search for the item by ITS id AND the RESTAURANT'S id
    const deletedItem = await Menu.findByIdAndDelete(itemId);

    if (deletedItem) {
      res.json({ success: true, message: "Item deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// ✅ SECURE UPDATE API
app.put("/menu/:id", async (req, res) => {
  try {
    const { name, price, image } = req.body;

    // 1. Validation check
    if (!price || !name) {
      return res.status(400).json({ success: false, message: "Name and Price are required" });
    }

    // 2. Update the document in MongoDB
    const updatedItem = await Menu.findByIdAndUpdate(
      req.params.id, 
      { name, price, image }, 
      { new: true } // This option returns the MODIFIED document, not the old one
    );

    if (updatedItem) {
      res.json({ success: true, message: "Item updated successfully", data: updatedItem });
    } else {
      res.status(404).json({ success: false, message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



//Creating order model
const orderSchema = new mongoose.Schema({
  table: String,
  items: Array,
  status: String,
  restaurantId: String   // 🔥 IMPORTANT
});

const Order = mongoose.model("Order", orderSchema);




// ========================
// 🔴 ADD ORDER WITH restaurantId
// FILE: server.js
// ========================

app.post("/order", async (req, res) => {

  const { table, items, restaurantId } = req.body;   // get data from frontend

  const newOrder = new Order({
    table: table,                                    // table number
    items: items,                                    // ordered items
    status: "Pending",                               // default status
    restaurantId: restaurantId                       // 🔥 attach restaurantId
  });

  await newOrder.save();                             // save order in database

  res.json(newOrder);                                // send response

});




// ========================
// 🔵 GET ORDERS BY restaurantId
// FILE: server.js
// ========================

app.get("/order", async (req, res) => {

  const { restaurantId } = req.query; 
  // get restaurantId from request

  const orders = await Order.find({ restaurantId: restaurantId }); 
  // fetch only this restaurant's orders

  res.json(orders); 
  // send filtered orders

});



// ✅ SECURE ORDER STATUS UPDATE
app.put("/order/:id", async (req, res) => {
  try {
    const { status } = req.body; // e.g., "Preparing", "Completed", or "Cancelled"

    // 1. Basic Validation
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    // 2. Update only the status field
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true } // Return the updated order data
    );

    if (updatedOrder) {
      res.json({ 
        success: true, 
        message: "Order status updated", 
        data: updatedOrder 
      });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// ========================
// 🟡 RESTAURANT SIGNUP API
// ========================

app.post("/signup", async (req, res) => {     // create POST API for signup
  const { name, email, password } = req.body; // get data from frontend request

  const newRestaurant = new Restaurant({      // create new restaurant object
    name: name,                               // assign name
    email: email,                             // assign email
    password: password                        // assign password
  });

  await newRestaurant.save();                 // save data into MongoDB database

  res.json({ success: true });                // send success response to frontend
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});