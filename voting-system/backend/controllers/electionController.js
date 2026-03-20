const db = require("../config/db");

const getPublicElections = async (req, res) => {
  const sql = `
    SELECT id, title, start_date, end_date, status
    FROM elections
    ORDER BY id DESC
  `;

  try {
    const result = await db.read(sql);
    res.json(result);
  } catch (err) {
    console.error("Get public elections error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getCandidatesByElection = async (req, res) => {
  const electionId = req.params.electionId;

  const sql = `
    SELECT
      c.id,
      c.name,
      c.party,
      c.photo,
      c.position_id,
      p.name AS position_title,
      e.title AS election,
      c.election_id
    FROM candidates c
    LEFT JOIN positions p ON c.position_id = p.id
    LEFT JOIN elections e ON c.election_id = e.id
    WHERE c.election_id = ?
    ORDER BY p.id ASC
  `;

  try {
    const result = await db.read(sql, [electionId]);
    res.json(result);
  } catch (err) {
    console.error("Get candidates error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getPublicElections,
  getCandidatesByElection,
};