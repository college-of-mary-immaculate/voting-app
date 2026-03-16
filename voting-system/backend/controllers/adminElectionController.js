const db = require("../config/db");

exports.getElections = (req, res) => {
  const sql = "SELECT * FROM elections ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.addElection = (req, res) => {
  const { title, description, start_date, end_date, status } = req.body;

  if (!title || !start_date || !end_date) {
    return res.status(400).json({ message: "Title and start/end dates are required" });
  }

  const sql = `
    INSERT INTO elections (title, description, start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [title, description || '', start_date, end_date, status || 'upcoming'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Election added", id: result.insertId });
  });
};

exports.updateElection = (req, res) => {
  const id = req.params.id;
  const { title, description, start_date, end_date, status } = req.body;

  const sql = `
    UPDATE elections
    SET title=?, description=?, start_date=?, end_date=?, status=?
    WHERE id=?
  `;
  db.query(sql, [title, description, start_date, end_date, status, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Election updated" });
  });
};

exports.deleteElection = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM elections WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Election deleted" });
  });
};