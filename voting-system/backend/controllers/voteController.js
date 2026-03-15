// controllers/voteController.js
const db = require("../config/db");

exports.vote = (req, res) => {
  const user_id = req.user.id;
  const { candidate_id, election_id } = req.body;

  const getCandidate = `
    SELECT position_id
    FROM candidates
    WHERE id = ? AND election_id = ?
  `;

  db.query(getCandidate, [candidate_id, election_id], (err, candidateResult) => {
    if (err) return res.status(500).json(err);

    if (candidateResult.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const position_id = candidateResult[0].position_id;

    const checkVote = `
      SELECT id
      FROM votes
      WHERE user_id = ?
      AND election_id = ?
      AND position_id = ?
      LIMIT 1
    `;

    db.query(checkVote, [user_id, election_id, position_id], (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        return res.status(400).json({ message: "You already voted for this position" });
      }

      const insertVote = `
        INSERT INTO votes (user_id, candidate_id, election_id, position_id)
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertVote, [user_id, candidate_id, election_id, position_id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Vote recorded successfully" });
      });
    });
  });
};

exports.checkVote = (req, res) => {
  const user_id = req.user.id;
  const election_id = req.params.electionId;

  const sql = `
    SELECT position_id
    FROM votes
    WHERE user_id = ?
    AND election_id = ?
  `;

  db.query(sql, [user_id, election_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ votedPositions: result.map(r => r.position_id) });
  });
};