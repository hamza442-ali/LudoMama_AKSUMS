const express = require('express');
const router = express.Router();

const tournamentController = require('../../controllers/admin/tournamentController');

// Create a new tournament
router.post('/createTournament', tournamentController.createTournament);
// Get all tournaments
router.get('/getAllTournaments', tournamentController.getAllTournaments);
// Delete tournament by ID
router.delete('/deleteTournamentById/:id', tournamentController.deleteTournamentById);

module.exports = router;
