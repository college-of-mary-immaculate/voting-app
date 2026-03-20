const db = require("../config/db");

const getPublicElections = (req, res) => {
  const sql = `
    SELECT
      id,
      title,
      DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
      status
    FROM elections
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

const getCandidatesByElection = (req, res) => {
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
      DATE_FORMAT(e.start_date, '%Y-%m-%d') AS election_start_date,
      DATE_FORMAT(e.end_date, '%Y-%m-%d') AS election_end_date,
      c.election_id
    FROM candidates c
    LEFT JOIN positions p ON c.position_id = p.id
    LEFT JOIN elections e ON c.election_id = e.id
    WHERE c.election_id = ?
    ORDER BY p.id ASC
  `;

  db.query(sql, [electionId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

module.exports = {
  getPublicElections,
  getCandidatesByElection
};