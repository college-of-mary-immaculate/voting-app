const express = require("express");
const router = express.Router();
const { getPublicElections, getCandidatesByElection } = require("../controllers/electionController");

// 1️⃣ Get all elections for dropdown
router.get("/", getPublicElections);

// 2️⃣ Get candidates for a selected election
router.get("/:electionId/candidates", getCandidatesByElection);

module.exports = router;