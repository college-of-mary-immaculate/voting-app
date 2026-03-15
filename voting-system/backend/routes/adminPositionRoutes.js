const express = require("express");
const router = express.Router();
const {
  getPositions,
  addPosition,
  updatePosition,
  deletePosition,
} = require("../controllers/adminPositionController");

const authenticateToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * tags:
 *   name: Positions
 *   description: Admin position management
 */

/**
 * @swagger
 * /positions:
 *   get:
 *     summary: Get all positions
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of positions
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
 */
router.get("/", getPositions);

/**
 * @swagger
 * /positions:
 *   post:
 *     summary: Add a new position
 *     tags: [Positions]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: President
 *     responses:
 *       201:
 *         description: Position created
 */
router.post("/", addPosition);

/**
 * @swagger
 * /positions/{id}:
 *   put:
 *     summary: Update a position
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Position ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vice President
 *     responses:
 *       200:
 *         description: Position updated
 */
router.put("/:id", updatePosition);

/**
 * @swagger
 * /positions/{id}:
 *   delete:
 *     summary: Delete a position
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Position ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Position deleted
 */
router.delete("/:id", deletePosition);

module.exports = router;