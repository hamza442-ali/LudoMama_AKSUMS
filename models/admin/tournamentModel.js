const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the prize schema to ensure proper structure
const prizeSchema = new Schema({
    position: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, { _id: false }); // _id: false ensures that prizes do not have their own unique IDs

// Define the tournament schema
const tournamentSchema = new Schema({ // Aksums Tec (Development)
    tournamentId: {
        type: String,
        required: true,
        unique: true
    },
    entryFee: {
        type: Number,
        required: true
    },
    joiningStartTime: {
        type: Date,
        required: true
    },
    joiningEndTime: {
        type: Date,
        required: true
    },
    gameplayStartTime: {
        type: Date,
        required: true
    },
    gameplayEndTime: {
        type: Date,
        required: true
    },
    numberOfRounds: {
        type: Number,
        required: true
    },
    prizes: [prizeSchema], // Use the prize schema to define the structure of each prize
    playerCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to calculate prizes based on the number of players
tournamentSchema.methods.calculatePrizes = function() {
    const totalPlayers = this.playerCount;
    let prizes = [];

    if (totalPlayers <= 100) {
        prizes.push({ position: 1, amount: 100 });
        prizes.push({ position: 2, amount: 50 });
        prizes.push({ position: 3, amount: 25 });

        for (let i = 4; i <= 10; i++) {
            prizes.push({ position: i, amount: 5 });
        }
        for (let i = 11; i <= 50; i++) {
            prizes.push({ position: i, amount: 2 });
        }
    } else if (totalPlayers <= 500) {
        prizes.push({ position: 1, amount: 200 });
        prizes.push({ position: 2, amount: 100 });
        prizes.push({ position: 3, amount: 50 });

        for (let i = 4; i <= 10; i++) {
            prizes.push({ position: i, amount: 15 });
        }
        for (let i = 11; i <= 50; i++) {
            prizes.push({ position: i, amount: 10 });
        }
        for (let i = 51; i <= 100; i++) {
            prizes.push({ position: i, amount: 5 });
        }
    }

    this.prizes = prizes;
};

module.exports = mongoose.model('Tournament', tournamentSchema);
