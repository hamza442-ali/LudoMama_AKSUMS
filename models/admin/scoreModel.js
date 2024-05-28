const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreSchema = new Schema({    // Aksums Tec (Development)
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tournamentId: {
        type: Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    round: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Score', scoreSchema);
