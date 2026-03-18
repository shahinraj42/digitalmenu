const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Temporary database
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
app.get("/orders", (req, res) => {
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