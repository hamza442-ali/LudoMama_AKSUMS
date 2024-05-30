const express = require('express');
const router = express.Router();

const scoreController = require('../../controllers/admin/scoreController');

// Record a score
router.post('/recordScore', scoreController.recordScore);
// Get all scores
router.get('/getAllScores', scoreController.getAllScores);
// Delete score by ID
router.delete('/deleteScoreById/:id', scoreController.deleteScoreById);

module.exports = router;
