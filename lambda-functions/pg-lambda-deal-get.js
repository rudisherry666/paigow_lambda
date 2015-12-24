var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    dynamodb, session;

exports.handler = function(event, context) {
    var response;

    console.log('pg-lambda-deal-get');
    console.log(event);

    dynamodb = dbUtils.getDynamoDB();

    function validateRequest() {
        var defer = q.defer();
        if (!event.gameHash) {
            defer.reject({
                error: 'No gameHash supplied for getting deal',
                code: 'PG_ERROR_MISSING_GAME_HASH_PARAMETER'
            });
        } else if (!event.dealIndex) {
            defer.reject({
                error: 'No dealIndex supplied for getting deal',
                code: 'PG_ERROR_MISSING_DEAL_INDEX_PARAMETER'
            });
        } else if (!event.player) {
            defer.reject({
                error: 'No player supplied for getting deal',
                code: 'PG_ERROR_MISSING_PLAYER_PARAMETER'
            });
        } else if (event.player !== "both" && event.player !== "player" && event.player !== "opponent") {
            defer.reject({
                error: 'Bad player supplied for getting deal',
                code: 'PG_ERROR_BAD_PLAYER_PARAMETER'
            });
        } else {
            console.log('Request validated');
            defer.resolve();
        }
        return defer.promise;
    }

    // Actually do the work, now that all the functions have been created.
    validateRequest()
    .then(function() {
        var dealID = event.gameHash + '#' + event.dealIndex;
        console.log('Getting deal with ID: ' + dealID);
        return dbUtils.getItem(dynamodb, 'deal', 'dealID', dealID);
    })
    .then(function(deal) {
        var i, retDeal;

        console.log('got deal:');
        console.log(deal);

        // Cloak the opponent's tiles if both players haven't set yet.
        if (deal.situation.player !== 'TILES_ARE_SET' ||
                deal.situation.opponent !== 'TILES_ARE_SET') {
            console.log('cloaking opponent tiles');
            for (i = 12; i < 24; i++) deal.tiles[i] = 32;
        }
        context.succeed(deal);
    })
    .fail(function(err) {
        console.log('fail, no deal or could not get it');
        context.succeed(err);
    });
};
