const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {

    const hashed = await bcrypt.hash(password, 10);

    await db.write(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed]
    );

    return res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Register error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already registered" });
    }

    return res.status(500).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.read(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "SECRETKEY",
      { expiresIn: "24h" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message });
  }
};