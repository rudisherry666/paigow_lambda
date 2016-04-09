var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    _ = require('underscore'),
    dynamodb, session;

exports.handler = function(event, context) {

    console.log('pg-lambda-players-get');
    console.log(event);

    dynamodb = dbUtils.getDynamoDB();

    function validateRequest() {
        return dbUtils.validatePlayer(dynamodb, event.sessionHash);
    }

    // Actually do the work, now that all the functions have been created.
    dynamodb = new (require('dynamodb-doc')).DynamoDB();
    validateRequest()
    .then(function(player) {
        dynamodb.scan({
            TableName: 'player'
        }, function(err, data) {
            if (err) {
                console.log('Error trying to find players, error: ' + JSON.stringify(err));
                context.succeed( {
                    error: 'Error trying to find players',
                    code: 'PG_ERROR_DB_SCAN_PLAYERS'
                });
            } else if (!data) {
                console.log('No players found for user ' + player.username);
                context.succeed({
                    info: 'No players for user',
                    code: 'PG_RESPONSE_NO_PLAYERS'
                });
            } else {
                console.log(data);
                var retVal = _.map(data.Items, function(onePlayer) {
                    console.log(onePlayer);
                    return {
                        username: onePlayer.username,
                        situation: onePlayer.situation
                    };
                });
                console.log(retVal);
                context.succeed(retVal);
            }
        });
    })
    .fail(function(err) {
        console.log('fail, no players or could not get it');
        context.succeed(err);
    });
};
