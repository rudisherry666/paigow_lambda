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

        console.log('got deal: ' + deal);
        console.log('looking at player "' + event.player + '"' );

        // We return different things depending on what's asked for.
        switch (event.player) {
            case "both":
                // Everything is wanted: if the deal isn't finished, this is
                // an error.
                if (deal.situation.player !== 'TILES_ARE_SET' ||
                        deal.situation.opponent !== 'TILES_ARE_SET') {
                    console.log('Not returning both because deal is not done');
                    return q.reject({
                        error: 'Deal not done, cannot return info',
                        code: 'PG_ERROR_DEAL_NOT_DONE_FOR_BOTH'
                    });
                }
                retDeal = deal;
            break;

            case "player":
                // Just want the players tiles.  Always OK.
                retDeal = {
                    tiles: deal.tiles,
                    situation: deal.situation
                };
                for (i = 12; i < 24; i++) retDeal.tiles[i] = 32;
            break;

            case "opponent":
                // Opponents tiles can't be returned until the player is set.
                if (deal.situation.player !== 'TILES_ARE_SET' ||
                        deal.situation.opponent !== 'TILES_ARE_SET') {
                    console.log('Not returning opponent because deal is not done');
                    return q.reject({
                        error: 'Deal not done, cannot return info',
                        code: 'PG_ERROR_DEAL_NOT_DONE_FOR_OPPONENT'
                    });
                }

                // Just return the tiles.
                retDeal = {
                    tiles: deal.tiles,
                    situation: deal.situation
                };
            break;
        }
        context.succeed(retDeal);
    })
    .fail(function(err) {
        console.log('fail, no deal or could not get it');
        context.succeed(err);
    });
};
