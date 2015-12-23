var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    dynamodb, session;

exports.handler = function(event, context) {

    console.log('pg-lambda-xxx');
    console.log(event);

    dynamodb = dbUtils.getDynamoDB();

    function validateRequest() {
        var defer = q.defer();

        defer.resolve();

        return defer.promise;
    }

    // Actually do the work, now that all the functions have been created.
    validateRequest()
    .then(function() {
        context.succeed('xxx');
    });
};
