const db = require("../config/db");

exports.getResults = (req, res) => {
  const election_id = req.params.electionId;

  const sql = `
    SELECT 
      c.id AS candidate_id,
      c.name AS candidate,
      c.position_id,
      p.name AS position,
      COUNT(v.id) AS votes
    FROM candidates c
    LEFT JOIN positions p ON c.position_id = p.id
    LEFT JOIN votes v ON v.candidate_id = c.id AND v.election_id = ?
    WHERE c.election_id = ?
    GROUP BY c.id
    ORDER BY p.id
  `;

  db.query(sql, [election_id, election_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};