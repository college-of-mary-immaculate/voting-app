const db = require("../config/db");
const { pub } = require("../config/redis");

// GET ALL
exports.getCandidates = (req, res) => {
  const sql = `
    SELECT c.id, c.name, c.party, c.election_id, c.position_id,
           e.title AS election_title,
           p.name AS position_title,
           c.photo
    FROM candidates c
    LEFT JOIN elections e ON c.election_id = e.id
    LEFT JOIN positions p ON c.position_id = p.id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};

// ADD
exports.addCandidate = (req, res) => {
  const { name, party, election_id, position_id } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!name || !party || !election_id || !position_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const insertSql = `
    INSERT INTO candidates (name, party, election_id, position_id, photo)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    insertSql,
    [name, party, election_id, position_id, photo],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      // 🔥 GET position_title
      const posSql = "SELECT name FROM positions WHERE id=?";
      db.query(posSql, [position_id], (err, posRes) => {
        if (err) return res.status(500).json({ message: err.message });

        const position_title = posRes[0]?.name || "Unknown Position";

        const newCandidate = {
          id: result.insertId,
          name,
          party,
          election_id: Number(election_id),
          position_id: Number(position_id),
          position_title, // ✅ FIX
          photo,
        };

        pub.publish(
          "candidate_updates",
          JSON.stringify({ action: "added", candidate: newCandidate })
        );

        res.status(201).json({
          message: "Candidate added successfully",
          candidate: newCandidate,
        });
      });
    }
  );
};

// UPDATE
exports.updateCandidate = (req, res) => {
  const id = Number(req.params.id);
  const { name, party, election_id, position_id } = req.body;
  const photo = req.file ? req.file.filename : null;

  const updateSql = `
    UPDATE candidates
    SET name=?, party=?, election_id=?, position_id=?, photo=COALESCE(?, photo)
    WHERE id=?
  `;

  db.query(
    updateSql,
    [name, party, election_id, position_id, photo, id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });

      // 🔥 GET position_title
      const posSql = "SELECT name FROM positions WHERE id=?";
      db.query(posSql, [position_id], (err, posRes) => {
        if (err) return res.status(500).json({ message: err.message });

        const position_title = posRes[0]?.name || "Unknown Position";

        const updatedCandidate = {
          id,
          name,
          party,
          election_id: Number(election_id),
          position_id: Number(position_id),
          position_title,
          photo,
        };

        pub.publish(
          "candidate_updates",
          JSON.stringify({ action: "updated", candidate: updatedCandidate })
        );

        res.json({
          message: "Candidate updated successfully",
          candidate: updatedCandidate,
        });
      });
    }
  );
};

// DELETE
exports.deleteCandidate = (req, res) => {
  const id = Number(req.params.id);

  const sql = "DELETE FROM candidates WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });

    pub.publish(
      "candidate_updates",
      JSON.stringify({ action: "deleted", candidateId: id })
    );

    res.json({
      message: "Candidate deleted successfully",
      candidateId: id,
    });
  });
};

// PHOTO UPLOAD
exports.uploadCandidatePhoto = (req, res) => {
  const candidateId = Number(req.params.id);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const sql = "UPDATE candidates SET photo=? WHERE id=?";

  db.query(sql, [req.file.filename, candidateId], (err) => {
    if (err) return res.status(500).json({ message: err.message });

    pub.publish(
      "candidate_updates",
      JSON.stringify({
        action: "photo_updated",
        candidateId,
        photo: req.file.filename,
      })
    );

    res.json({
      message: "Photo uploaded successfully",
      filename: req.file.filename,
    });
  });
};