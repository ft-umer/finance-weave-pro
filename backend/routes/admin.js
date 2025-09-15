const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");
const SECRET = process.env.JWT_SECRET || "mydefaultsecret";

const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};


// Admin signup
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, company } = req.body;

  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // Check if email exists
    const [existing] = await db.promise().query(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db
      .promise()
      .query(
        "INSERT INTO admins (first_name, last_name, email, password, company) VALUES (?, ?, ?, ?, ?)",
        [firstName, lastName, email, hashedPassword, company || null]
      );

    res.status(201).json({ message: "Admin created successfully", adminId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

// Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing email or password" });

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );
    const admin = rows[0];
    if (!admin)
      return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, email: admin.email }, SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, adminId: admin.id, email: admin.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});


// Get all invoices
router.get('/invoices', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM invoices ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/invoices/:invoiceId
router.patch("/:invoiceId", authenticateAdmin, async (req, res) => {
  const { invoiceId } = req.params;
  const { status } = req.body;

  if (!["paid", "pending", "cancelled", "overdue"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    // Fetch the invoice
    const [rows] = await db.promise().execute(
      "SELECT * FROM invoices WHERE id = ?",
      [invoiceId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Update the status
    await db.promise().execute(
      "UPDATE invoices SET status = ? WHERE id = ?",
      [status, invoiceId]
    );

    // Return updated invoice
    const [updatedRows] = await db.promise().execute(
      "SELECT * FROM invoices WHERE id = ?",
      [invoiceId]
    );

    res.json({ message: "Invoice status updated successfully", invoice: updatedRows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// GET /api/admin/invoices/:invoiceId/download
router.get("/invoices/:invoiceId/download", authenticateAdmin, async (req, res) => {
  const { invoiceId } = req.params;

  try {
    // Fetch invoice from DB
    const [invoiceRows] = await db.promise().execute(
      "SELECT * FROM invoices WHERE id = ?",
      [invoiceId]
    );

    if (!invoiceRows.length) return res.status(404).json({ message: "Invoice not found" });

    const invoice = invoiceRows[0];

    // Fetch user who created the invoice
    const [userRows] = await db.promise().execute(
      "SELECT * FROM users WHERE id = ?",
      [invoice.user_id]
    );

    if (!userRows.length) return res.status(404).json({ message: "Invoice creator not found" });

    const user = userRows[0];

    // Fetch items from invoice_items table
    const [items] = await db.promise().execute(
      "SELECT description, quantity, rate, amount FROM invoice_items WHERE invoice_id = ?",
      [invoiceId]
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Invoice");

    // Set column widths
    sheet.columns = [
      { key: "A", width: 25 },
      { key: "B", width: 15 },
      { key: "C", width: 15 },
      { key: "D", width: 20 },
    ];

    // === Title ===
    sheet.mergeCells("A1:D1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "INVOICE";
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: "center" };

    // === Company Info from user ===
    sheet.mergeCells("A3:B3");
    sheet.getCell("A3").value = user.company;
    sheet.getCell("A3").font = { bold: true };

    sheet.mergeCells("A4:B4");
    sheet.getCell("A4").value = invoice.clientAddress;

    // === Invoice Info ===
    sheet.getCell("C3").value = "Invoice Number:";
    sheet.getCell("D3").value = invoice.invoiceNumber;
    sheet.getCell("C3").font = { bold: true };
    sheet.getCell("D3").alignment = { horizontal: "right" };

    sheet.getCell("C4").value = "Date:";
    sheet.getCell("D4").value = invoice.date;

    sheet.getCell("C5").value = "Due Date:";
    sheet.getCell("D5").value = invoice.dueDate;

    // === Client Info ===
    sheet.mergeCells("A6:B6");
    sheet.getCell("A6").value = "Bill To:";
    sheet.getCell("A6").font = { bold: true };

    sheet.mergeCells("A7:B7");
    sheet.getCell("A7").value = invoice.clientName;

    sheet.mergeCells("A8:B8");
    sheet.getCell("A8").value = invoice.clientEmail;

    sheet.mergeCells("A9:B9");
    sheet.getCell("A9").value = invoice.clientAddress;

    // === Items Table ===
    const startRow = 11;
    sheet.getRow(startRow).values = ["Description", "Quantity", "Rate", "Amount"];
    sheet.getRow(startRow).font = { bold: true };
    sheet.getRow(startRow).alignment = { horizontal: "left" };

    items.forEach((item, idx) => {
      const row = sheet.getRow(startRow + 1 + idx);
      row.values = [item.description, item.quantity, item.rate, item.amount];
      row.values.forEach((cell, colIndex) => {
        sheet.getCell(`${String.fromCharCode(65 + colIndex)}${startRow + 1 + idx}`).alignment = { horizontal: "left" };
      });
    });

    // === Total ===
    const totalRow = sheet.getRow(startRow + 1 + items.length);
    totalRow.getCell(3).value = "Total:";
    totalRow.getCell(4).value = invoice.total;
    totalRow.font = { bold: true };
    totalRow.getCell(4).numFmt = '"$"#,##0.00';

    // === Notes ===
    const notesRow = startRow + 3 + items.length;
    sheet.mergeCells(`A${notesRow}:D${notesRow}`);
    sheet.getCell(`A${notesRow}`).value = `Notes: ${invoice.notes || ""}`;
    sheet.getCell(`A${notesRow}`).alignment = { wrapText: true };

    // Send Excel file
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
