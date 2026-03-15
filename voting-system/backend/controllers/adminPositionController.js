const db = require("../config/db");

exports.getPositions = (req, res) => {
  const electionId = req.query.election_id;
  let sql = `
    SELECT p.id, p.name, p.election_id, e.title AS election_title
    FROM positions p
    JOIN elections e ON p.election_id = e.id
  `;
  const params = [];

  if (electionId) {
    sql += " WHERE p.election_id = ?";
    params.push(electionId);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.addPosition = (req, res) => {
  const { name, election_id } = req.body;
  if (!name || !election_id) return res.status(400).json({ message: "Name and election required" });

  const sql = "INSERT INTO positions (name, election_id) VALUES (?, ?)";
  db.query(sql, [name, election_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Position added" });
  });
};

exports.updatePosition = (req, res) => {
  const { name, election_id } = req.body;
  const id = req.params.id;

  const sql = "UPDATE positions SET name=?, election_id=? WHERE id=?";
  db.query(sql, [name, election_id, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Position updated" });
  });
};

exports.deletePosition = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM positions WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Position deleted" });
  });
};