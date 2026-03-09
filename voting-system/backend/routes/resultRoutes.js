const express = require("express");
const router = express.Router();

const { getResults } = require("../controllers/resultController");

/**
 * @swagger
 * tags:
 *   name: Results
 *   description: Election results
 */

/**
 * @swagger
 * /api/results/{electionId}:
 *   get:
 *     summary: Get results for a specific election
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: electionId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Election ID
 *     responses:
 *       200:
 *         description: List of candidates with vote counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   candidate_id:
 *                     type: integer
 *                   candidate:
 *                     type: string
 *                   votes:
 *                     type: integer
 */

router.get("/:electionId", getResults);

module.exports = router;