//schemas 


// Tournament schema
{
    tournamentID: String,
    entryFee: Number,
    joiningStart: Date,
    joiningEnd: Date,
    gameplayStart: Date,
    gameplayEnd: Date,
    rounds: Number,
    prizes: {
      first: Number,
      second: Number,
      third: Number
    },
    playerCount: Number,
    players: [String] // List of user IDs
  }
  
  // User Participation schema
  {
    userID: String,
    tournamentID: String,
    joinedAt: Date,
    roundsPlayed: Number,
    scores: [Number] // List of scores per round
  }
  
  // User schema 
  {
    userid: String,
    points: Number,
    winning_amount: Number,
  
  }

  


  //  creation of tournaments 



  exports.CreateTournament = function(socket, adminInfo, tournamentInfo) {
    // Check if the user is an admin
    if (!adminInfo.isAdmin) {
        socket.emit('REQ_CREATE_TOURNAMENT_RESULT', { result: 'failed', reason: 'Unauthorized' });
        return;
    }

    let collection = database.collection('tournaments');
    let query = {
        tournamentID: tournamentInfo.tournamentID,
        entryFee: tournamentInfo.entryFee,
        joiningStart: new Date(tournamentInfo.joiningStart),
        joiningEnd: new Date(tournamentInfo.joiningEnd),
        gameplayStart: new Date(tournamentInfo.gameplayStart),
        gameplayEnd: new Date(tournamentInfo.gameplayEnd),
        rounds: tournamentInfo.rounds,
        prizes: tournamentInfo.prizes,
        playerCount: 0,
        players: []
    };

    collection.insertOne(query, function(err) {
        if (err) {
            console.log(err);
            socket.emit('REQ_CREATE_TOURNAMENT_RESULT', { result: 'failed' });
        } else {
            console.log("---- Success Create Tournament ----");
            socket.emit('REQ_CREATE_TOURNAMENT_RESULT', { result: 'success', tournamentID: tournamentInfo.tournamentID });
        }
    });
};









// result declaration 


exports.DeclareResults = function(tournamentID) {
    let participationCollection = database.collection('participations');
    let tournamentCollection = database.collection('tournaments');
    let userCollection = database.collection('userdatas');

    tournamentCollection.findOne({ tournamentID: tournamentID }, function(err, tournament) {
        if (err || !tournament) return;

        let currentTime = new Date();
        if (currentTime <= tournament.gameplayEnd) return; // Ensure gameplay period is over

        participationCollection.find({ tournamentID: tournamentID }).toArray(function(err, participations) {
            if (err) return;

            // Sort players by total score
            participations.sort((a, b) => b.scores.reduce((sum, score) => sum + score, 0) - a.scores.reduce((sum, score) => sum + score, 0));

            // Distribute prizes
            if (participations[0]) userCollection.updateOne({ userid: participations[0].userID }, { $inc: { winning_amount: tournament.prizes.first } });
            if (participations[1]) userCollection.updateOne({ userid: participations[1].userID }, { $inc: { winning_amount: tournament.prizes.second } });
            if (participations[2]) userCollection.updateOne({ userid: participations[2].userID }, { $inc: { winning_amount: tournament.prizes.third } });

            // Clean up tournament data after a day
            setTimeout(() => {
                participationCollection.deleteMany({ tournamentID: tournamentID });
                tournamentCollection.deleteOne({ tournamentID: tournamentID });
            }, 24 * 60 * 60 * 1000); // 1 day in milliseconds
        });
    });
};





// databases 

exports.initdatabase = function(db) {
    database = db;
    // Schedule result declaration
    setInterval(() => {
        let collection = database.collection('tournaments');
        collection.find().toArray(function(err, tournaments) {
            if (err) return;
            tournaments.forEach(tournament => {
                DeclareResults(tournament.tournamentID);
            });
        });
    }, 60 * 60 * 1000); // Check every hour
};

exports.setsocketio = function(socketio) {
    io = socketio;
    io.on('connection', function(socket) {
        socket.on('REQ_CREATE_TOURNAMENT', function(data) {
            CreateTournament(socket, data.adminInfo, data.tournamentInfo);
        });
        socket.on('REQ_JOIN_TOURNAMENT', function(data) {
            JoinTournament(socket, data.userInfo, data.tournamentID);
        });
        socket.on('REQ_RECORD_SCORE', function(data) {
            RecordScore(socket, data.userInfo, data.tournamentID, data.score);
        });
    });
};



