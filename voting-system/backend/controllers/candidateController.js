const db = require("../config/db");

exports.getCandidates = async (req, res) => {
  const sql = `
    SELECT
      c.id,
      c.name,
      c.party,
      c.photo,
      c.election_id,
      c.position_id,
      e.title AS election,
      p.name AS position_title
    FROM candidates c
    LEFT JOIN elections e ON c.election_id = e.id
    LEFT JOIN positions p ON c.position_id = p.id
    ORDER BY p.id
  `;

  try {
    const result = await db.read(sql);
    res.json(result);
  } catch (err) {
    console.error("Get candidates error:", err);
    res.status(500).json({ error: "Server error" });
  }
};