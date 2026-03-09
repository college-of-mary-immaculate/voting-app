const db = require("../config/db");

exports.vote = (req, res) => {

  const user_id = req.user.id;
  const { candidate_id, election_id } = req.body;

  const checkVote = `
    SELECT * FROM votes
    WHERE user_id = ? AND election_id = ?
  `;

  db.query(checkVote, [user_id, election_id], (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    if (result.length > 0) {
      return res.status(400).json({
        message: "You have already voted in this election"
      });
    }

    const insertVote = `
      INSERT INTO votes (user_id, candidate_id, election_id)
      VALUES (?, ?, ?)
    `;

    db.query(insertVote, [user_id, candidate_id, election_id], (err) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Vote recorded successfully"
      });

    });

  });

};