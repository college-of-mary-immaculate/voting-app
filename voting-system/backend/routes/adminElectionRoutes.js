const express = require("express");
const router = express.Router();

const {
  getElections,
  addElection,
  updateElection,
  deleteElection,
  startElection,
  endElection
} = require("../controllers/adminElectionController");

const authenticateToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// Protect all admin routes
router.use(authenticateToken, isAdmin);

// CRUD
router.get("/", getElections);
router.post("/", addElection);
router.put("/:id", updateElection);
router.delete("/:id", deleteElection);

// Lifecycle actions
router.put("/:id/start", startElection);
router.put("/:id/end", endElection);

module.exports = router;