// createAdmin.js
const db = require("./db"); // Make sure this points to your database connection file
const bcrypt = require("bcrypt");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) =>
  new Promise((resolve) => readline.question(question, resolve));

(async () => {
  try {
    const firstName = await askQuestion("Enter admin first name: ");
    const lastName = await askQuestion("Enter admin last name: ");
    const email = await askQuestion("Enter admin email: ");
    const company = await askQuestion("Enter admin company: ");
    const password = await askQuestion("Enter admin password: ");

    if (!firstName || !lastName || !email || !company || !password) {
      console.log("All fields are required. Exiting.");
      process.exit(1);
    }

    // Check if email already exists
    const [existing] = await db
      .promise()
      .query("SELECT id FROM admins WHERE email = ?", [email]);

    if (existing.length > 0) {
      console.log("Admin with this email already exists. Exiting.");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db
      .promise()
      .query(
        "INSERT INTO admins (first_name, last_name, email, company, password) VALUES (?, ?, ?, ?, ?)",
        [firstName, lastName, email, company, hashedPassword]
      );

    console.log(`Admin created successfully! ID: ${result.insertId}`);
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
})();
