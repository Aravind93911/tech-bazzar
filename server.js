const express = require("express");
const cors = require("cors");
const { connectDb } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TechBazaar Backend Running");
});

app.post("/login", async (req, res) => {
  try {
    const db = await connectDb();
    const { email, password } = req.body;

    const result = await db.query(
      "SELECT * FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const db = await connectDb();
    const { name, email, password, phone } = req.body;

    const check = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ error: "Email exists" });
    }

    const result = await db.query(
      "INSERT INTO users(name,email,password,phone) VALUES($1,$2,$3,$4) RETURNING *",
      [name, email, password, phone]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
