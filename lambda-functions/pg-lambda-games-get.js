var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    dynamodb, session;

exports.handler = function(event, context) {
    var response;

    console.log('pg-lambda-games-get');
    console.log(event);

    // All we need is a valid session and player: this will resolve
    // with the player or reject.
    function validateRequest() {
        return dbUtils.validatePlayer(dynamodb, event.sessionHash);
    }

    // Actually do the work, now that all the functions have been created.
    dynamodb = new (require('dynamodb-doc')).DynamoDB();
    validateRequest()
    .then(function(player) {
        console.log('Have player, calling dynamodb.query');
        dynamodb.scan({
            TableName: 'game',
            ExpressionAttributeValues: { ':username': player.username },
            FilterExpression: 'contains(players, :username)'
        }, function(err, data) {
            if (err) {
                console.log('Error trying to find games, error: ' + JSON.stringify(err));
                context.succeed( {
                    error: 'Error trying to find games',
                    code: 'PG_ERROR_DB_SCAN_GAMES'
                });
            } else if (!data) {
                console.log('No games found for user ' + player.username);
                context.succeed({
                    info: 'No games for user',
                    code: 'PG_RESPONSE_NO_GAMES'
                });
            } else {
                // We found all the games that contain our username, but if there
                // are other users whose username includes ours, they'll be
                // included too.  There is no way for FilterExpression to do the
                // right thing, so we do it here.
                console.log('Have games, filtering');
                console.log(data.Items);
                var games = data.Items || [], i,
                    playerFirst = new RegExp('^' + player.username + '\\|'),
                    playerLast  = new RegExp('\\|' + player.username + '$'),
                    gameHashes = [];
                for (i = games.length-1; i >= 0; i--) {
                    var players = games[i].players;
                    console.log('game: ' + players);
                    console.log('players:' + players);
                    if (playerFirst.test(players) || playerLast.test(players)) {
                        console.log(players + ' is valid');
                        gameHashes.push(games[i].gameHash);
                    }
                }

                console.log('Games found for user ' + player.username);
                console.log(JSON.stringify(gameHashes));
                context.succeed(gameHashes);
            }
        });
    })
    .fail(function(err) {
        context.succeed(err);
    });
};
