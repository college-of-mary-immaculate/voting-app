const db = require("../config/db");
const { io } = require("../server");

// ------------------ GET ALL ------------------
exports.getCandidates = async (req, res) => {
  const sql = `
    SELECT c.id, c.name, c.party, c.election_id, c.position_id,
           e.title AS election_title,
           p.name AS position_title,
           c.photo
    FROM candidates c
    LEFT JOIN elections e ON c.election_id = e.id
    LEFT JOIN positions p ON c.position_id = p.id
  `;

  try {
    const results = await db.read(sql);
    res.json(results);
  } catch (err) {
    console.error("Get candidates error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ ADD ------------------
exports.addCandidate = async (req, res) => {
  const { name, party, election_id, position_id } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!name || !party || !election_id || !position_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const insertSql = `
    INSERT INTO candidates (name, party, election_id, position_id, photo)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const result = await db.write(insertSql, [
      name,
      party,
      election_id,
      position_id,
      photo,
    ]);

    const posRes = await db.read(
      "SELECT name FROM positions WHERE id=?",
      [position_id]
    );

    const position_title = posRes[0]?.name || "Unknown Position";

    const newCandidate = {
      id: result.insertId,
      name,
      party,
      election_id: Number(election_id),
      position_id: Number(position_id),
      position_title,
      photo,
    };

    // ✅ SINGLE EMIT (handled by Redis adapter)
    io.emit("candidate_update", {
      action: "added",
      candidate: newCandidate,
    });

    res.status(201).json({
      message: "Candidate added successfully",
      candidate: newCandidate,
    });
  } catch (err) {
    console.error("Add candidate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ UPDATE ------------------
exports.updateCandidate = async (req, res) => {
  const id = Number(req.params.id);
  const { name, party, election_id, position_id } = req.body;
  const photo = req.file ? req.file.filename : null;

  const updateSql = `
    UPDATE candidates
    SET name=?, party=?, election_id=?, position_id=?, photo=COALESCE(?, photo)
    WHERE id=?
  `;

  try {
    await db.write(updateSql, [
      name,
      party,
      election_id,
      position_id,
      photo,
      id,
    ]);

    const posRes = await db.read(
      "SELECT name FROM positions WHERE id=?",
      [position_id]
    );

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

    io.emit("candidate_update", {
      action: "updated",
      candidate: updatedCandidate,
    });

    res.json({
      message: "Candidate updated successfully",
      candidate: updatedCandidate,
    });
  } catch (err) {
    console.error("Update candidate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ DELETE ------------------
exports.deleteCandidate = async (req, res) => {
  const id = Number(req.params.id);

  try {
    await db.write("DELETE FROM candidates WHERE id=?", [id]);

    io.emit("candidate_update", {
      action: "deleted",
      candidateId: id,
    });

    res.json({
      message: "Candidate deleted successfully",
      candidateId: id,
    });
  } catch (err) {
    console.error("Delete candidate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ UPLOAD PHOTO ------------------
exports.uploadCandidatePhoto = async (req, res) => {
  const candidateId = Number(req.params.id);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    await db.write(
      "UPDATE candidates SET photo=? WHERE id=?",
      [req.file.filename, candidateId]
    );

    io.emit("candidate_update", {
      action: "photo_updated",
      candidateId,
      photo: req.file.filename,
    });

    res.json({
      message: "Photo uploaded successfully",
      filename: req.file.filename,
    });
  } catch (err) {
    console.error("Upload photo error:", err);
    res.status(500).json({ message: "Server error" });
  }
};