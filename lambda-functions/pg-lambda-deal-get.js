var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    dynamodb, session;

exports.handler = function(event, context) {
    var response;

    console.log('pg-lambda-deal-get');
    console.log(event);

    function validateRequest() {
        var defer = q.defer();
        if (!event.gameHash) {
            defer.reject({
                error: 'No gameHash supplied for getting deal',
                code: 'PG_ERROR_BAD_GAME_HASH_PARAMETER'
            });
        } else if (!event.dealIndex) {
            defer.reject({
                error: 'No dealIndex supplied for getting deal',
                code: 'PG_ERROR_BAD_DEAL_INDEX_PARAMETER'
            });
        } else {
            defer.resolve();
        }
        return defer.promise;
    }

    // Actually do the work, now that all the functions have been created.
    dynamodb = new (require('dynamodb-doc')).DynamoDB();
    validateRequest()
    .then(function() {
        var dealID = event.gameHash + '#' + event.dealIndex;
        return dbUtils.getItem(dynamodb, 'deal', 'dealID', dealID);
    })
    .then(function(deal) {
        // TODO: if the deal isn't done, don't pass down the opponent's
        // tiles: replace them with a hidden tile (32)
        var i;
        for (i = 12; i < 24; i++) deal.tiles[i] = 32;
        context.succeed(deal);
    })
    .fail(function(err) {
        console.log('fail, no deal or could not get it');
        context.succeed(err);
    });
};
