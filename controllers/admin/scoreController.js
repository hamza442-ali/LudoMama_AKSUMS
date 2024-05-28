const Score = require('../models/scoreModel');

const recordScore = (req, res) => {
    if (!req.body.userId || !req.body.tournamentId || !req.body.round || !req.body.score) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const score = new Score({
        userId: req.body.userId,
        tournamentId: req.body.tournamentId,
        round: req.body.round,
        score: req.body.score,
    });

    score.save()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({
            message: err.message || "Some error occurred while recording the Score."
        }));
};

const getAllScores = (req, res) => {
    Score.find()
        .populate('userId')
        .populate('tournamentId')
        .then(data => res.send(data))
        .catch(err => res.status(500).send({
            message: err.message || "Some error occurred while retrieving scores."
        }));
};

const deleteScoreById = (req, res) => {
    Score.findByIdAndRemove(req.params.id)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: `Cannot delete Score with id=${req.params.id}. Maybe Score was not found!` });
            } else {
                res.send({ message: "Score was deleted successfully!" });
            }
        })
        .catch(err => res.status(500).send({
            message: err.message || "Could not delete Score with id=" + req.params.id
        }));
};

module.exports = {
    recordScore,
    getAllScores,
    deleteScoreById
};
