var q = require('q'),
    dbUtils = require('db-utils'),
    dynamodb;

exports.handler = function(event, context) {
    var response;

    console.log('pg-lambda-deal-situation-get');
    console.log(event);

    dynamodb = dbUtils.getDynamoDB();

    function validateRequest() {
        var defer = q.defer();
        if (!event.gameHash) {
            defer.reject({
                error: 'No gameHash supplied for getting deal situation',
                code: 'PG_ERROR_MISSING_GAME_HASH_PARAMETER'
            });
        } else if (!event.dealIndex) {
            defer.reject({
                error: 'No dealIndex supplied for getting deal situation',
                code: 'PG_ERROR_MISSING_DEAL_INDEX_PARAMETER'
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
    .then(function(dbDeal) {
        context.succeed(dbDeal.situation);
    })
    .fail(function(err) {
        console.log('fail, no deal or could not get it');
        context.succeed(err);
    });
};
