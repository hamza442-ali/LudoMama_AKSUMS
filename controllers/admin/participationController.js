const Participation = require('../../models/admin/participationModel');
const Tournament = require('../../models/admin/tournamentModel');
const User = require('../../models/admin/userModel');

const joinTournament = (req, res) => {
    if (!req.body.userId || !req.body.tournamentId) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const participation = new Participation({
        userId: req.body.userId,
        tournamentId: req.body.tournamentId
    });

    participation.save()
        .then(data => {
            Tournament.findByIdAndUpdate(req.body.tournamentId, { $inc: { playerCount: 1 } })
                .then(() => res.send(data))
                .catch(err => res.status(500).send({
                    message: err.message || "Some error occurred while updating the Tournament player count."
                }));
        })
        .catch(err => res.status(500).send({
            message: err.message || "Some error occurred while joining the Tournament."
        }));
};

const getAllParticipations = (req, res) => {
    Participation.find()
        .populate('userId')
        .populate('tournamentId')
        .then(data => res.send(data))
        .catch(err => res.status(500).send({
            message: err.message || "Some error occurred while retrieving participations."
        }));
};

const deleteParticipationById = (req, res) => {
    Participation.findByIdAndRemove(req.params.id)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: `Cannot delete Participation with id=${req.params.id}. Maybe Participation was not found!` });
            } else {
                res.send({ message: "Participation was deleted successfully!" });
            }
        })
        .catch(err => res.status(500).send({
            message: err.message || "Could not delete Participation with id=" + req.params.id
        }));
};

module.exports = {
    joinTournament,
    getAllParticipations,
    deleteParticipationById
};
