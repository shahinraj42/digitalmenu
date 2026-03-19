const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Temporary database
let menu = [
  { name: "Burger", price: 200 },
  { name: "Coffee", price: 100 }
];

// Get menu
app.get("/menu", (req, res) => {
  res.json(menu);
});

// Add new item
app.post("/menu", (req, res) => {
  menu.push(req.body);
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



let orders = [];

// Receive order
app.post("/order", (req, res) => {
  const newOrder = {
    id: Date.now(),
    items: req.body.items,
    table: req.body.table,
    status: "Pending"
  };

  orders.push(newOrder);

  console.log("New Order Received:", newOrder);

  res.json({ message: "Order received" });
});

// Send all orders (for kitchen)
app.get("/order", (req, res) => {
  res.json(orders);
});


app.put("/order/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const order = orders.find(o => o.id === id);

  if (order) {
    order.status = req.body.status;
    res.json({ message: "Updated" });
  } else {
    res.status(404).json({ message: "Order not found" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});