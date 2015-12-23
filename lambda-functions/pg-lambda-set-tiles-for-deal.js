var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    pg = require('pg'),
    dynamodb, session;

exports.handler = function(event, context) {
    var response;

    // Set below
    var session, player, opponent, game, deal;

    console.log('pg-lambda-set-tiles-for-deal');
    console.log(event);

    function validateRequest() {
        var defer = q.defer();
        if (!event.dealID) {
            defer.reject({
                error: 'No deal supplied for setting tiles',
                code: 'PG_ERROR_MISSING_DEAL_PARAMETER'
            });
        } else {
            console.log('Request validated');
            defer.resolve();
        }
        return defer.promise;
    }

    // function addAnotherDeal() {
    //     var defer = q.defer();
        
    //     dbDeal.situation = "DONE";
    //     dbUtils.putItem(dynamodb, 'deal', deal)
    //     .then(function() {
    //         console.log('Deal is done, creating new deal');
    //         deal = pg.newDeal(event.gameHash, event.dealIndex + 1);

    //         // This goes in several steps.
    //         console.log(deal);

    //         return dbUtils.putItem(dynamodb, 'deal', deal);
    //     })
    //     .then(function() {
    //         console.log('New deal is saved, updating game');
    //         return dbUtils.getItem(dynamodb, 'game', 'gameHash', event.gameHash);
    //     })
    //     .then(function(game) {
    //         console.log('Got game for deal, updating deal index');
    //         game.lastDealIndex = deal.dealIndex;
    //         return dbUtils.putItem(dynamodb, 'game', game);
    //     })
    //     .then(function() {
    //         console.log('addAnotherDeal succeeded.');
    //         defer.resolve();
    //     })
    //     .fail(function(err) {
    //         console.log('addAnotherDeal failed');
    //         console.log(err);
    //         defer.reject(err);
    //     });

    //     return defer.promise;
    // }

    // Actually do the work, now that all the functions have been created.
    dynamodb = new (require('dynamodb-doc')).DynamoDB();
    validateRequest()
    .then(function() {
        return dbUtils.validateSession(dynamodb, event.sessionHash);
    })
    .then(function() {
        console.log('validated Session');
        console.log('Getting deal with ID: ' + event.dealID);
        return dbUtils.getItem(dynamodb, 'deal', 'dealID', event.dealID);
    })
    .then(function(dbDeal) {
        console.log('Setting computer tiles for deal');

        // TODO: do it here.
        // deal = setTilesForDeal(dbDeal);

        deal = dbDeal;
        console.log(deal);

        return dbUtils.putItem(dynamodb, 'deal', deal);
    })
    .then(function() {
        console.log('set-tiles success!');
        context.succeed(deal);
    })
    .fail(function(err) {
        console.log('set-tiels failure!');
        console.log(err);
        context.succeed(err);
    });
};
