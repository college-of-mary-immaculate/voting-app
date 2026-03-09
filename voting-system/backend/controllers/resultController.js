const db = require("../config/db");

exports.getResults = (req, res) => {

  const electionId = req.params.electionId;

  const sql = `
    SELECT c.id AS candidate_id, c.name AS candidate, COUNT(v.id) AS votes
    FROM candidates c
    LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = ?
    WHERE c.election_id = ?
    GROUP BY c.id
  `;

  db.query(sql, [electionId, electionId], (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

};