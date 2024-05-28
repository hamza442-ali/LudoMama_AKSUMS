var MongoClient = require('mongodb').MongoClient;
// var URL = 'mongodb+srv://ludomamasales:TCJg1MT2NjuyeEjK@ludomama.2b45hb8.mongodb.net/?retryWrites=true&w=majority&appName=LudoMama';


var state = {
    db: null,
};

exports.connect = function(done) {
    
    if (state.db)
        return done();

    MongoClient.connect(process.env.URL,{ useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
        if (err)
            return done(err);
        var db = client.db('LudoMama');
        state.db = db;
        done();
    });
};

exports.get = function() {
    return state.db;
};

exports.close = function(done) {
    if (state.db) {
        state.db.close(function(err, result) {
            state.db = null;
            state.mode = null;
            done(err);
        });
    }
};