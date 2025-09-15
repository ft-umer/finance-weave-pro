const express = require("express");
const router = express.Router();
const db = require("../db"); // <-- MySQL connection
const authMiddleware = require("../middleware/authMiddleware"); // <-- import your auth middleware

// Create Invoice (Protected)
router.post("/create", authMiddleware, async (req, res) => {
  const { invoiceNumber, clientName, clientEmail, clientAddress, date, dueDate, notes, total, status, items } = req.body;

  try {
    const userId = req.user.id; // ✅ should now work

    const [result] = await db.promise().query(
      `INSERT INTO invoices (user_id, invoiceNumber, clientName, clientEmail, clientAddress, date, dueDate, notes, total, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, invoiceNumber, clientName, clientEmail, clientAddress, date, dueDate, notes, total, status]
    );

    const invoiceId = result.insertId;

    for (const item of items) {
      await db.promise().query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount)
         VALUES (?, ?, ?, ?, ?)`,
        [invoiceId, item.description, item.quantity, item.rate, item.amount]
      );
    }

    res.status(201).json({ message: "✅ Invoice created successfully", invoiceId });
  } catch (error) {
    console.error("❌ Error creating invoice:", error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

router.get("/my-invoices", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [invoices] = await db.promise().query(
      `SELECT id, invoiceNumber, date, total AS amount, status, notes AS description 
       FROM invoices WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    res.json(invoices);
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

module.exports = router;
