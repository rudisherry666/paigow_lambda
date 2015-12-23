var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    pg = require('pg'),
    dynamodb, session;

exports.handler = function(event, context) {

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

    function compareHands(hand1, hand2) {
        // TODO: Here is some real work
        return utils.compareArraysBySum(hand1, hand2);
    }

    function setTilesForHand(tiles, ih) {
        var start = 12 + (ih * 4),
            handTiles = tiles.slice(start, start + 4);

        console.log('hand before sorting:');
        console.log(handTiles);

        // TODO: here is more real work.
        handTiles.sort(function(a, b) {
            return (a > b) ? 1 : ((a < b) ? -1 : 0);
        });

        console.log('hand after sorting:');
        console.log(handTiles);

        return handTiles;
    }

    function setTilesForDeal(deal) {
        console.log('computer tiles before sorting:');
        console.log(deal.tiles.slice(12, 24));

        // Make the three hands the best we can.
        var ih, computerHands = [];
        for (ih = 0; ih < 3; ih++) {
            computerHands.push(setTilesForHand(deal.tiles, ih));
        }

        // Sort the three hands
        computerHands.sort(compareHands);
        var computerTiles = computerHands[0]
            .concat(computerHands[1])
            .concat(computerHands[2]);

        Array.prototype.splice.apply(deal.tiles, [12, 12].concat(computerTiles));
        console.log('computer tiles after sorting:');
        console.log(deal.tiles.slice(12, 24));

        // Computer is always the opponent.
        deal.situation.opponent = 'TILES_ARE_SET';

        return deal;
    }

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
        console.log(dbDeal);

        deal = setTilesForDeal(dbDeal);
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
