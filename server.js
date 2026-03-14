const express = require("express");
const cors = require("cors");
const { connectDb } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
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
});

app.post("/register", async (req, res) => {
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
});

app.listen(10000, () => console.log("Server running"));
