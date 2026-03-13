const db = require("../config/db");

// Get results for a specific election
exports.getResults = (req, res) => {
  const electionId = req.params.electionId;

  const sql = `
    SELECT
      c.id AS candidate_id,
      c.name AS candidate,
      COUNT(v.id) AS votes
    FROM candidates c
    LEFT JOIN votes v
      ON c.id = v.candidate_id AND v.election_id = ?
    WHERE c.election_id = ?
    GROUP BY c.id
  `;

  db.query(sql, [electionId, electionId], (err, result) => {
    if (err) {
      console.error("Error fetching results:", err);
      return res.status(500).json({ message: "Server error", error: err });
    }

    res.json(result);
  });
};