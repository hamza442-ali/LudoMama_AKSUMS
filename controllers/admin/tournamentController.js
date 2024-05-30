const Tournament = require('../../models/admin/tournamentModel');

const createTournament = (req, res) => {
    console.log(req.body);
    const {
        tournamentId,
        entryFee,
        joiningStartTime,
        joiningEndTime,
        gameplayStartTime,
        gameplayEndTime,
        numberOfRounds,
        prizes
    } = req.body;

    // Check for missing required fields
    if (!tournamentId || !entryFee || !joiningStartTime || !joiningEndTime || !gameplayStartTime || !gameplayEndTime || !numberOfRounds) {
        return res.status(400).send({ message: "Required fields are missing!" });
    }

    const tournament = new Tournament({
        tournamentId,
        entryFee,
        joiningStartTime,
        joiningEndTime,
        gameplayStartTime,
        gameplayEndTime,
        numberOfRounds,
        prizes,
        playerCount: 0
    });

    tournament.save()
        .then(data => res.send(data))
        .catch(err => {
            // Handle duplicate key error
            if (err.code === 11000) {
                return res.status(400).send({ message: "Duplicate tournament ID. Please provide a unique ID." });
            }
            // Log detailed error information
            console.error("Error saving tournament:", err);
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Tournament."
            });
        });
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
