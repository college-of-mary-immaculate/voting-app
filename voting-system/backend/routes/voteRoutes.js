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

/**
 * @swagger
 * /api/vote/check/{electionId}:
 *   get:
 *     summary: Check if user already voted (JWT required)
 *     tags: [Vote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: electionId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Election ID to check vote
 *     responses:
 *       200:
 *         description: Returns if user has voted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 voted:
 *                   type: boolean
 */
router.get("/check/:electionId", authenticateToken, voteController.checkVote);

module.exports = router;