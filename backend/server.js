// server.js
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const invoice = require("./routes/invoice");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors());
app.use(express.json());



app.use("/api/admin", adminRoutes);

// ✅ Auth routes
app.use("/api/auth", authRoutes);

// ✅ Invoice routes
app.use("/api/invoices", invoice);

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
