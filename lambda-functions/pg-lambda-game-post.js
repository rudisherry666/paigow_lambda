var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
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
        deal = pg.newDeal(game.gameHash,  0);
        console.log('deal: ');
        console.log(deal);
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
        var defer = q.defer();

        console.log('setting if we have to set tiles for opponent: ' + event.opponent);

        // If we're playing against the computer, it needs to set its tiles.
        if (event.opponent !== 'computer') return true;

        console.log('seting tiles for opponent: ' + event.opponent);
        var lambda = new aws.Lambda();
        console.log('added lambda: ' + lambda);
        var params = {
            FunctionName: 'pg-lambda-set-tiles-for-deal',
            // ClientContext: 'STRING_VALUE',
            InvocationType: 'Event', // 'Event | RequestResponse | DryRun',
            LogType: 'None', // 'None | Tail',
            Payload: // new Buffer('...') || 'STRING_VALUE',
                JSON.stringify({
                    sessionHash: event.sessionHash,
                    dealID: deal.dealID
                })
            // Qualifier: 'STRING_VALUE'
        };
        console.log('created params:');
        console.log(params);
        lambda.invoke(params, function(err, data) {
            if (err) {
                console.log('Lambda error:');
                console.log(err, err.stack); // an error occurred
                defer.resolve();    // TODO: wtf do we do here?
            } else {
                console.log('Lambda success:');
                console.log(data);           // successful response
                defer.resolve();
            }
        });

        return defer.promise;
    })
    .then(function() {
        // All success! Return the game ID.
        context.succeed({ gameHash: game.gameHash });
    })
    .fail(function(err) {
        // TODO: if writing some stuff failled, we have to back out.
        // i.e. make it transaction based.
        context.succeed(err);
    });
};
