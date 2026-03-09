const express = require("express");
const router = express.Router();

const {
  getCandidates
} = require("../controllers/candidateController");

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Public candidate information
 */

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Get all candidates
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: List of candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   party:
 *                     type: string
 *                   election_id:
 *                     type: integer
 *                   photo:
 *                     type: string
 */

router.get("/", getCandidates);

module.exports = router;