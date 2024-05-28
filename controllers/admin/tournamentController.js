const Tournament = require('../models/tournamentModel');

const createTournament = (req, res) => {
    if (!req.body.tournamentId || !req.body.entryFee || !req.body.joiningStartTime || !req.body.joiningEndTime || !req.body.gameplayStartTime || !req.body.gameplayEndTime || !req.body.numberOfRounds) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const tournament = new Tournament({
        tournamentId: req.body.tournamentId,
        entryFee: req.body.entryFee,
        joiningStartTime: req.body.joiningStartTime,
        joiningEndTime: req.body.joiningEndTime,
        gameplayStartTime: req.body.gameplayStartTime,
        gameplayEndTime: req.body.gameplayEndTime,
        numberOfRounds: req.body.numberOfRounds,
        prizes: req.body.prizes,
        playerCount: 0,
    });

    tournament.save()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({
            message: err.message || "Some error occurred while creating the Tournament."
        }));
};

const getAllTournaments = (req, res) => {
    Tournament.find()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({
            message: err.message || "Some error occurred while retrieving tournaments."
        }));
};

const deleteTournamentById = (req, res) => {
    Tournament.findByIdAndRemove(req.params.id)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: `Cannot delete Tournament with id=${req.params.id}. Maybe Tournament was not found!` });
            } else {
                res.send({ message: "Tournament was deleted successfully!" });
            }
        })
        .catch(err => res.status(500).send({
            message: err.message || "Could not delete Tournament with id=" + req.params.id
        }));
};

module.exports = {
    createTournament,
    getAllTournaments,
    deleteTournamentById
};
