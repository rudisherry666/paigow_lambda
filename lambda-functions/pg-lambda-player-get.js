var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    dynamodb, session;

exports.handler = function(event, context) {
    var response;

    console.log('pg-lambda-player-get');
    console.log(event);

    function validateRequest() {
        return dbUtils.validatePlayer(dynamodb, event.sessionHash);
    }

    // Actually do the work, now that all the functions have been created.
    dynamodb = new (require('dynamodb-doc')).DynamoDB();
    validateRequest()
    .then(function(player) {
        context.succeed(player);
    })
    .fail(function(err) {
        console.log('fail, no player or could not get it');
        context.succeed(err);
    });
};
