const db = require("../config/db");
const { io } = require("../server");

//////////////////////////////////////////
// HELPER: FORMAT DATE
//////////////////////////////////////////
const toMySQLDateTime = (date) => {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  return d.toISOString().slice(0, 19).replace("T", " ");
};

//////////////////////////////////////////
// HELPER: AUTO STATUS
//////////////////////////////////////////
const computeStatus = (start, end) => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate) || isNaN(endDate)) return "upcoming";

  if (now < startDate) return "upcoming";
  if (now >= startDate && now <= endDate) return "active";
  if (now > endDate) return "ended";

  return "upcoming";
};

//////////////////////////////////////////
// GET ALL
//////////////////////////////////////////
exports.getElections = async (req, res) => {
  try {
    const result = await db.read(
      "SELECT * FROM elections ORDER BY id DESC"
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

//////////////////////////////////////////
// ADD
//////////////////////////////////////////
exports.addElection = async (req, res) => {
  const { title, description, start_date, end_date } = req.body;

  if (!title || !start_date || !end_date) {
    return res.status(400).json({
      message: "Title and start/end dates are required",
    });
  }

  try {
    const start = toMySQLDateTime(start_date);
    const end = toMySQLDateTime(end_date);

    if (!start || !end) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const status = computeStatus(start, end);

    const result = await db.write(
      `INSERT INTO elections (title, description, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?)` ,
      [title, description || "", start, end, status]
    );

    // ✅ SOCKET EMIT
    io.emit("election_update", {
      action: "added",
      electionId: result.insertId,
    });

    res.json({
      message: "Election added",
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

//////////////////////////////////////////
// UPDATE
//////////////////////////////////////////
exports.updateElection = async (req, res) => {
  const id = req.params.id;
  const { title, description, start_date, end_date } = req.body;

  try {
    const result = await db.read(
      "SELECT * FROM elections WHERE id=?",
      [id]
    );

    const existing = result[0];
    if (!existing) {
      return res.status(404).json({ message: "Election not found" });
    }

    const start = start_date
      ? toMySQLDateTime(start_date)
      : existing.start_date;

    const end = end_date
      ? toMySQLDateTime(end_date)
      : existing.end_date;

    if (!start || !end) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const updated = {
      title: title || existing.title,
      description: description || existing.description,
      start_date: start,
      end_date: end,
    };

    const status = computeStatus(updated.start_date, updated.end_date);

    await db.write(
      `UPDATE elections
       SET title=?, description=?, start_date=?, end_date=?, status=?
       WHERE id=?`,
      [
        updated.title,
        updated.description,
        updated.start_date,
        updated.end_date,
        status,
        id,
      ]
    );

    io.emit("election_update", {
      action: "updated",
      electionId: id,
    });

    res.json({ message: "Election updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

//////////////////////////////////////////
// START
//////////////////////////////////////////
exports.startElection = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.read(
      "SELECT * FROM elections WHERE id=?",
      [id]
    );

    if (!result[0]) {
      return res.status(404).json({ message: "Election not found" });
    }

    await db.write(
      `UPDATE elections SET start_date = NOW(), status='active' WHERE id=?`,
      [id]
    );

    io.emit("election_update", {
      action: "started",
      electionId: id,
    });

    res.json({ message: "Election started" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

//////////////////////////////////////////
// END
//////////////////////////////////////////
exports.endElection = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.read(
      "SELECT * FROM elections WHERE id=?",
      [id]
    );

    if (!result[0]) {
      return res.status(404).json({ message: "Election not found" });
    }

    await db.write(
      `UPDATE elections SET end_date = NOW(), status='ended' WHERE id=?`,
      [id]
    );

    io.emit("election_update", {
      action: "ended",
      electionId: id,
    });

    res.json({ message: "Election ended" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

//////////////////////////////////////////
// DELETE
//////////////////////////////////////////
exports.deleteElection = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.write(
      "DELETE FROM elections WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    io.emit("election_update", {
      action: "deleted",
      electionId: id,
    });

    res.json({ message: "Election deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};