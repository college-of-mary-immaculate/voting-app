const db = require("../config/db");

exports.getCandidates = (req, res) => {
  const sql = "SELECT * FROM candidates";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.addCandidate = (req, res) => {
  const { name, party, election_id, photo } = req.body;
  const sql = "INSERT INTO candidates (name, party, election_id, photo) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, party, election_id, photo || null], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Candidate added" });
  });
};

exports.updateCandidate = (req, res) => {
  const id = req.params.id;
  const { name, party, photo } = req.body;
  const sql = "UPDATE candidates SET name=?, party=?, photo=? WHERE id=?";
  db.query(sql, [name, party, photo || null, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Candidate updated" });
  });
};

exports.deleteCandidate = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM candidates WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Candidate deleted" });
  });
};

exports.uploadCandidatePhoto = (req, res) => {
  const candidateId = req.params.id;
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const photoPath = req.file.filename;
  const sql = "UPDATE candidates SET photo=? WHERE id=?";
  db.query(sql, [photoPath, candidateId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Photo uploaded successfully", filename: photoPath });
  });
};