var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    dynamodb, session;

exports.handler = function(event, context) {
    var response;

    console.log('pg-lambda-session-get');
    console.log(event);

    function validateRequest() {
        var defer = q.defer();

        q.resolve();

        return defer.promise;
    }

    // Actually do the work, now that all the functions have been created.
    dynamodb = new (require('dynamodb-doc')).DynamoDB();
    validateRequest()
    .then(function() {
        context.succeed('xxx');
    });
};
