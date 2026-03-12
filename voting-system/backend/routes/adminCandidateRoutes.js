const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const adminCandidateController = require("../controllers/adminCandidateController");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, "photo-" + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Candidate management (admin)
 */

/**
 * @swagger
 * /api/admin/candidates:
 *   get:
 *     summary: Get all candidates
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: List of candidates
 */
router.get("/", adminCandidateController.getCandidates);

/**
 * @swagger
 * /api/admin/candidates:
 *   post:
 *     summary: Add a new candidate
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               party:
 *                 type: string
 *               election_id:
 *                 type: integer
 *               position_id:
 *                 type: integer
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Candidate created
 */
router.post("/", upload.single("photo"), adminCandidateController.addCandidate);

/**
 * @swagger
 * /api/admin/candidates/{id}:
 *   put:
 *     summary: Update a candidate
 *     tags: [Candidates]
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
 *               name:
 *                 type: string
 *               party:
 *                 type: string
 *               election_id:
 *                 type: integer
 *               position_id:
 *                 type: integer
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Candidate updated
 */
router.put("/:id", upload.single("photo"), adminCandidateController.updateCandidate);

/**
 * @swagger
 * /api/admin/candidates/{id}:
 *   delete:
 *     summary: Delete a candidate
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Candidate deleted
 */
router.delete("/:id", adminCandidateController.deleteCandidate);

/**
 * @swagger
 * /api/admin/candidates/{id}/photo:
 *   post:
 *     summary: Upload candidate photo
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Photo uploaded
 */
router.post("/:id/photo", upload.single("photo"), adminCandidateController.uploadCandidatePhoto);

module.exports = router;