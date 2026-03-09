const express = require("express");
const router = express.Router();

const voteController = require("../controllers/voteController");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Vote
 *   description: User voting
 */

/**
 * @swagger
 * /api/vote:
 *   post:
 *     summary: Cast a vote (JWT required)
 *     tags: [Vote]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidate_id
 *               - election_id
 *             properties:
 *               candidate_id:
 *                 type: integer
 *               election_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *       400:
 *         description: User already voted in this election
 */

router.post("/", authenticateToken, voteController.vote);

module.exports = router;