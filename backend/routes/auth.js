// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // your MySQL connection
const authMiddleware = require("../middleware/authMiddleware"); // import your auth middleware

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const SECRET = process.env.JWT_SECRET || "mydefaultsecret";

    // 🔑 Only include what exists in your table
    const token = jwt.sign(
      { id: user.id },  // no role since it doesn't exist
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, company: user.company }
    });
  });
});


router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, company } = req.body;
    // console.log(req.body);

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email already exists
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) return res.status(500).json({ message: err.message });

        if (results.length > 0) {
          return res.status(400).json({ message: "Email already registered" });
        }

        // Insert new user
        const sql =
          "INSERT INTO users (first_name, last_name, email, password, company) VALUES (?, ?, ?, ?, ?)";
        db.query(
          sql,
          [firstName, lastName, email, hashedPassword, company],
          (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({
              message: "User registered successfully",
              userId: result.insertId,
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/invoices/:invoiceId/download
router.get("/invoices/:invoiceId/download", authMiddleware, async (req, res) => {
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
