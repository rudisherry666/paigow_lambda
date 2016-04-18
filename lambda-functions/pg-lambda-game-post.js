var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    gameUtils = require('game-utils'),
    pg = require('pg'),
    aws = require('aws-sdk'),
    dynamodb, session;

exports.handler = function(event, context) {
    var session, player, opponent, game, deal;

    console.log('pg-lambda-game-post');
    console.log(event);

    dynamodb = dbUtils.getDynamoDB();

    function validateRequest() {
        var defer = q.defer();
        if (!event.opponent) {
            // If there is no opponnent, bad request.
            console.log('bad parameter');
            response = { error: 'Bad parameter', code: 'PG_ERROR_BAD_PARAMETER_NO_OPPONENT' };
            defer.reject(response);
        } else {
            dbUtils.verifyDescribeTable(dynamodb, 'player')
            .then(function() {
                return dbUtils.getItem(dynamodb, 'player', 'username', event.opponent);
            })
            .then(function(locOpponent) {
                opponent = locOpponent;
                console.log('validateRequest success');
                defer.resolve(opponent);
            })
            .fail(function(err) {
                defer.reject(err);
            });
        }

        return defer.promise;
    }

    validateRequest()
    .then(function() {
        return dbUtils.validateSession(dynamodb, event.sessionHash);
    })
    .then(function(locSession) {
        // Session is valid, rememeber it; validate game table
        session = locSession;
        return dbUtils.verifyDescribeTable(dynamodb, 'game');
    })
    .then(function() {
        // player table is valid; get the current player.
        return dbUtils.getItem(dynamodb, 'player', 'username', session.username);
    })
    .then(function(locPlayer) {
        player = locPlayer;

        console.log('have player, creating game and deal');

        // we have a player.  Create a game and deal.
        game = {
            gameHash: utils.newRandomID(),
            players: player.username + '|' + opponent.username,
            situation: event.opponent === 'computer' ? 'IN_PROGRESS' : 'CREATED',
            startTime: new Date().getTime(),
            score: [0, 0],
            lastDealIndex: 0
        };
        console.log(pg);
        return gameUtils.createNewDeal(dynamodb, game, 0);
    })
    .then(function(savedDeal) {
        console.log('Deal and game saved, adding game to session');
        deal = savedDeal;

        // Game and deal have been created.  Put that info into the session.
        session.gameHash = game.gameHash;
        return dbUtils.putItem(dynamodb, 'session', session);
    })
    .then(function() {
        var defer = q.defer();

        console.log('seeing if we have to set tiles for opponent: ' + event.opponent);

        // If we're playing against the computer, it needs to set its tiles.
        if (event.opponent !== 'computer') return true;

        return gameUtils.haveComputerSetTiles(event.sessionHash, event.opponent, deal);
    })
    .then(function() {
        console.log('SUCCESS: { gameHash: ' + game.gameHash + '}');
        // All success! Return the game ID.
        context.succeed({ gameHash: game.gameHash });
    })
    .fail(function(err) {
        console.log('FAIL: ' + err);
        // TODO: if writing some stuff failled, we have to back out.
        // i.e. make it transaction based.
        context.succeed(err);
    });
};
