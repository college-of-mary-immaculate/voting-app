const db = require("../config/db");
const { pub } = require("../config/redis");

exports.vote = (req, res) => {
  const user_id = req.user.id;
  const { candidate_id, election_id } = req.body;

  if (!candidate_id || !election_id) {
    return res.status(400).json({ message: "Missing fields" });
  }

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

    const insertVote = `
      INSERT INTO votes (user_id, candidate_id, election_id, position_id)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertVote,
      [user_id, candidate_id, election_id, position_id],
      async (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              message: "You already voted for this position",
            });
          }
          return res.status(500).json(err);
        }

        try {
          await pub.publish(
            "vote_updates",
            JSON.stringify({
              electionId: election_id,
              candidateId: candidate_id,
              positionId: position_id,
              userId: user_id,
              time: Date.now(),
            })
          );
        } catch (redisErr) {
          console.error("Redis publish error:", redisErr);
        }

        res.json({
          message: "Vote recorded successfully",
          candidateId: candidate_id,
          positionId: position_id,
        });
      }
    );
  });
};

exports.checkVote = (req, res) => {
  const user_id = req.user.id;
  const election_id = req.params.electionId;

  const sql = `
    SELECT position_id
    FROM votes
    WHERE user_id = ? AND election_id = ?
  `;

  db.query(sql, [user_id, election_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      votedPositions: result.map((r) => r.position_id),
    });
  });
};