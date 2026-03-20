const db = require("../config/db");

exports.getPositions = async (req, res) => {
  const electionId = req.query.election_id;
  let sql = `
    SELECT p.id, p.name, p.election_id, e.title AS election_title
    FROM positions p
    JOIN elections e ON p.election_id = e.id
  `;
  const params = [];

  if (electionId) {
    sql += " WHERE p.election_id = ?";
    params.push(electionId);
  }

  try {
    const results = await db.read(sql, params);
    res.json(results);
  } catch (err) {
    console.error("Get positions error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addPosition = async (req, res) => {
  const { name, election_id } = req.body;
  if (!name || !election_id) return res.status(400).json({ message: "Name and election required" });

  const sql = "INSERT INTO positions (name, election_id) VALUES (?, ?)";
  try {
    await db.write(sql, [name, election_id]);
    res.json({ message: "Position added" });
  } catch (err) {
    console.error("Add position error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updatePosition = async (req, res) => {
  const { name, election_id } = req.body;
  const id = req.params.id;

  const sql = "UPDATE positions SET name=?, election_id=? WHERE id=?";
  try {
    await db.write(sql, [name, election_id, id]);
    res.json({ message: "Position updated" });
  } catch (err) {
    console.error("Update position error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deletePosition = async (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM positions WHERE id=?";
  try {
    await db.write(sql, [id]);
    res.json({ message: "Position deleted" });
  } catch (err) {
    console.error("Delete position error:", err);
    res.status(500).json({ error: "Server error" });
  }
};