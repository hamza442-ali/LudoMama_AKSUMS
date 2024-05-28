const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const participationSchema = new Schema({   // Aksums Tec (Development)
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
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Participation', participationSchema);
