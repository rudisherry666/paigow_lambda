var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    dynamodb, session;

exports.handler = function(event, context) {
    var response;

    // Set below
    var session, player, opponent, game, deal;

    console.log('pg-lambda-game-post');
    console.log(event);

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

    // Actually do the work, now that all the functions have been created.
    dynamodb = new (require('dynamodb-doc')).DynamoDB();
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

        // we have a player.  Create a game and deal.
        game = {
            gameHash: utils.newRandomID(),
            players: player.username + '|' + opponent.username,
            situation: 'CREATED',
            startTime: new Date().getTime(),
            score: [0, 0]
        };
        deal = {
            'game-hash': game.gameHash,
            'deal-index': 0,
            'situation': [
                'TILES_NOT_SET',
                'TILES_NOT_SET'
            ],
            'points': [ 0, 0 ]
        };
        return q.all([
            dbUtils.putItem(dynamodb, 'deal', deal),
            dbUtils.putItem(dynamodb, 'game', game)
        ]);
    })
    .then(function() {
        // Game and deal have been created.  Put that info into the session.
        session.gameHash = game.gameHash;
        return dbUtils.putItem(dynamodb, 'session', session);
    })
    .then(function() {
        // All success! Return the game ID.
        context.succeed({ http_body: game.gameHash, http_status: 201, code: 'PG_INFO_GAME_CREATED' });
    })
    .fail(function(err) {
        // TODO: if writing some stuff failled, we have to back out.
        // i.e. make it transaction based.
        context.succeed(err);
    });
};
