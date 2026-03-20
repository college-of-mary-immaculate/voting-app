const express = require("express");
const router = express.Router();

const voteController = require("../controllers/voteController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, voteController.vote);
router.get("/check/:electionId", authenticateToken, voteController.checkVote);

module.exports = router;