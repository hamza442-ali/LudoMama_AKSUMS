const express = require('express');
const router = express.Router();

const participationController = require('../../controllers/admin/participationController');

// Join a tournament
router.post('/joinTournament', participationController.joinTournament);
// Get all participations
router.get('/getAllParticipations', participationController.getAllParticipations);
// Delete participation by ID
router.delete('/deleteParticipationById/:id', participationController.deleteParticipationById);

module.exports = router;
