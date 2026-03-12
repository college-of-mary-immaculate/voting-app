const express = require("express");
const router = express.Router();

const {
  getElections,
  addElection,
  updateElection,
  deleteElection
} = require("../controllers/adminElectionController");

const authenticateToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: AdminElections
 *   description: Admin election management (JWT + admin role)
 */

router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * /api/admin/elections:
 *   get:
 *     summary: Get all elections (admin only)
 *     tags: [AdminElections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of elections
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
 *                   date:
 *                     type: string
 */

/**
 * @swagger
 * /api/admin/elections:
 *   post:
 *     summary: Add a new election (admin only)
 *     tags: [AdminElections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Election added
 */

/**
 * @swagger
 * /api/admin/elections/{id}:
 *   put:
 *     summary: Update an election (admin only)
 *     tags: [AdminElections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Election ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Election updated
 *
 *   delete:
 *     summary: Delete an election (admin only)
 *     tags: [AdminElections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Election ID
 *     responses:
 *       200:
 *         description: Election deleted
 */

router.get("/", getElections);
router.post("/", addElection);
router.put("/:id", updateElection);
router.delete("/:id", deleteElection);

module.exports = router;