const db = require("../config/db");
const path = require("path");

exports.getCandidates = (req, res) => {
  const sql = `
    SELECT c.id, c.name, c.party, c.election_id, c.position_id,
           e.title AS election_title, p.name AS position_title,
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

exports.addCandidate = (req, res) => {
  const { name, party, election_id, position_id } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!name || !party || !election_id || !position_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO candidates (name, party, election_id, position_id, photo)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [name, party, election_id, position_id, photo], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: "Candidate added successfully" });
  });
};

exports.updateCandidate = (req, res) => {
  const id = req.params.id;
  const { name, party, election_id, position_id } = req.body;
  const photo = req.file ? req.file.filename : null;

  const sql = `
    UPDATE candidates
    SET name=?, party=?, election_id=?, position_id=?, photo=COALESCE(?, photo)
    WHERE id=?
  `;
  db.query(sql, [name, party, election_id, position_id, photo, id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Candidate updated successfully" });
  });
};

exports.deleteCandidate = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM candidates WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Candidate deleted successfully" });
  });
};

exports.uploadCandidatePhoto = (req, res) => {
  const candidateId = req.params.id;
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const sql = "UPDATE candidates SET photo=? WHERE id=?";
  db.query(sql, [req.file.filename, candidateId], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Photo uploaded successfully", filename: req.file.filename });
  });
};