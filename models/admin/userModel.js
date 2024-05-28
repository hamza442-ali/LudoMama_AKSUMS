const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({   // Aksums Tec (Development)
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    participationHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Participation'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
