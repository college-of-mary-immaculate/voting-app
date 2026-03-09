const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { uploadCandidatePhoto } = require("../controllers/adminCandidateController");

const {
  addCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidates
} = require("../controllers/adminCandidateController");

const authenticateToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: AdminCandidates
 *   description: Admin candidate management (JWT + admin role)
 */

/**
 * @swagger
 * /api/admin/candidates:
 *   get:
 *     summary: Get all candidates (admin only)
 *     tags: [AdminCandidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of candidates
 *
 *   post:
 *     summary: Add a new candidate (admin only)
 *     tags: [AdminCandidates]
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
 *               - party
 *               - election_id
 *             properties:
 *               name:
 *                 type: string
 *               party:
 *                 type: string
 *               election_id:
 *                 type: integer
 *               photo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidate added
 */

/**
 * @swagger
 * /api/admin/candidates/{id}:
 *   put:
 *     summary: Update a candidate (admin only)
 *     tags: [AdminCandidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               party:
 *                 type: string
 *               photo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidate updated
 *
 *   delete:
 *     summary: Delete a candidate (admin only)
 *     tags: [AdminCandidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate deleted
 */
/**
 * @swagger
 * /api/admin/candidates/upload/{id}:
 *   post:
 *     summary: Upload candidate photo (admin only)
 *     tags: [AdminCandidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 filename:
 *                   type: string
 */

router.use(authenticateToken, isAdmin);

router.get("/", getCandidates);
router.post("/", addCandidate);
router.put("/:id", updateCandidate);
router.delete("/:id", deleteCandidate);
router.post("/upload/:id", authenticateToken, isAdmin, upload.single("photo"), uploadCandidatePhoto);

module.exports = router;