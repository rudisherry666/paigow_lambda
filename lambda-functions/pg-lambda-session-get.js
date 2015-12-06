var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    dynamodb, session;

exports.handler = function(event, context) {
    var response;

    console.log('pg-lambda-session-get');
    console.log(event);

    function validateRequest() {
        return dbUtils.validateSession(dynamodb, event.sessionHash);
    }

    // Actually do the work, now that all the functions have been created.
    dynamodb = new (require('dynamodb-doc')).DynamoDB();
    validateRequest()
    .then(function() {
        return dbUtils.getItem(dynamodb, 'session', 'sessionHash', event.sessionHash);
    })
    .then(function(session) {
        context.succeed(session);
    })
    .fail(function(err) {
        console.log('fail, no session or could not get it');
        context.succeed(err);
    });
};
