const express = require("express");
const router = express.Router();
const { getPublicElections, getCandidatesByElection } = require("../controllers/electionController");

router.get("/", getPublicElections);

router.get("/:electionId/candidates", getCandidatesByElection);

module.exports = router;