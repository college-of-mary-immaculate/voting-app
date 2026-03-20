const db = require("../config/db");
const { io } = require("../server"); // ✅ use socket instead of Redis

// ------------------ VOTE ------------------
exports.vote = async (req, res) => {
  const user_id = req.user.id;
  const { candidate_id, election_id } = req.body;

  if (!candidate_id || !election_id) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    // Get position of candidate
    const candidateResult = await db.read(
      `SELECT position_id FROM candidates WHERE id = ? AND election_id = ?`,
      [candidate_id, election_id]
    );

    if (candidateResult.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const position_id = candidateResult[0].position_id;

    // Insert vote
    try {
      await db.write(
        `INSERT INTO votes (user_id, candidate_id, election_id, position_id)
         VALUES (?, ?, ?, ?)` ,
        [user_id, candidate_id, election_id, position_id]
      );
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "You already voted for this position",
        });
      }
      throw err;
    }

    // ✅ Emit via Socket.IO (SCALES via Redis adapter automatically)
    io.to(String(election_id)).emit("resultsUpdated", {
      electionId: election_id,
      candidateId: candidate_id,
      positionId: position_id,
      userId: user_id,
      time: Date.now(),
    });

    res.json({
      message: "Vote recorded successfully",
      candidateId: candidate_id,
      positionId: position_id,
    });

  } catch (err) {
    console.error("Vote controller error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ CHECK VOTE ------------------
exports.checkVote = async (req, res) => {
  const user_id = req.user.id;
  const election_id = req.params.electionId;

  try {
    const result = await db.read(
      `SELECT position_id FROM votes WHERE user_id = ? AND election_id = ?`,
      [user_id, election_id]
    );

    res.json({
      votedPositions: result.map((r) => r.position_id),
    });
  } catch (err) {
    console.error("Check vote error:", err);
    res.status(500).json({ error: "Server error" });
  }
};