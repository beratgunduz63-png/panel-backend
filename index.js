require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GİRİŞ API
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await pool.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  );

  if (user.rowCount === 0)
    return res.status(401).json({ error: "Hatalı giriş" });

  const match = await bcrypt.compare(password, user.rows[0].password);

  if (!match)
    return res.status(401).json({ error: "Hatalı giriş" });

  const token = jwt.sign(
    { id: user.rows[0].id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// PANEL KORUMASI
app.get("/panel", (req, res) => {
  res.json({ message: "Panele hoşgeldin" });
});

app.listen(3000, () => console.log("Server çalışıyor"));
