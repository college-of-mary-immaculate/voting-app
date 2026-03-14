const db = require("../config/db");

exports.vote = (req, res) => {
  const user_id = req.user.id;
  const { candidate_id, election_id } = req.body;

  // Step 1: Get candidate position
  const getCandidate = `
    SELECT position_id FROM candidates
    WHERE id = ?
  `;

  db.query(getCandidate, [candidate_id], (err, candidateResult) => {
    if (err) return res.status(500).json(err);

    if (candidateResult.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const position_id = candidateResult[0].position_id;

    // Step 2: Check if user already voted for this position
    const checkVote = `
      SELECT v.*
      FROM votes v
      JOIN candidates c ON v.candidate_id = c.id
      WHERE v.user_id = ?
      AND v.election_id = ?
      AND c.position_id = ?
    `;

    db.query(checkVote, [user_id, election_id, position_id], (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        return res.status(400).json({
          message: "You already voted for this position"
        });
      }

      // Step 3: Insert vote
      const insertVote = `
        INSERT INTO votes (user_id, candidate_id, election_id)
        VALUES (?, ?, ?)
      `;

      db.query(insertVote, [user_id, candidate_id, election_id], (err) => {
        if (err) return res.status(500).json(err);

        res.json({
          message: "Vote recorded successfully"
        });
      });
    });
  });
};

exports.checkVote = (req, res) => {
  const user_id = req.user.id;
  const election_id = req.params.electionId;

  const sql = `
    SELECT c.position_id
    FROM votes v
    JOIN candidates c ON v.candidate_id = c.id
    WHERE v.user_id = ?
    AND v.election_id = ?
  `;

  db.query(sql, [user_id, election_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      votedPositions: result.map(r => r.position_id)
    });
  });
};