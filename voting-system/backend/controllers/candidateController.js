const db = require("../config/db");

exports.getCandidates = (req, res) => {

  const sql = `
    SELECT
      c.id,
      c.name,
      c.party,
      c.photo,
      e.title AS election,
      p.name AS position
    FROM candidates c
    LEFT JOIN elections e ON c.election_id = e.id
    LEFT JOIN positions p ON c.position_id = p.id
    ORDER BY p.id
  `;

  db.query(sql, (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

};