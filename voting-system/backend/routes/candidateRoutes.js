const express = require("express");
const router = express.Router();

const { getCandidates } = require("../controllers/candidateController");

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Public candidate list
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
 *                   photo:
 *                     type: string
 *                   election:
 *                     type: string
 *                   position:
 *                     type: string
 */

router.get("/", getCandidates);

module.exports = router;