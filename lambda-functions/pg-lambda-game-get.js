var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    dynamodb, session;

exports.handler = function(event, context) {
    var response;

    console.log('pg-lambda-game-get');
    console.log(event);

    dynamodb = dbUtils.getDynamoDB();

    function validateRequest() {
        var defer = q.defer();
        if (!event.gameHash) {
            defer.reject({
                error: 'No hash supplied for getting game',
                code: 'PG_ERROR_BAD_GAME_PARAMETER'
            });
        } else {
            defer.resolve();
        }
        return defer.promise;
    }

    // Actually do the work, now that all the functions have been created.
    validateRequest()
    .then(function() {
        return dbUtils.getItem(dynamodb, 'game', 'gameHash', event.gameHash);
    })
    .then(function(game) {
        context.succeed(game);
    })
    .fail(function(err) {
        console.log('fail, no game or could not get it');
        context.succeed(err);
    });
};
