var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    pg = require('pg'),
    pgStrategy = require('pg-classes/pgstrategy'),
    pgSet = require('pg-classes/pgset'),
    dynamodb, session;

exports.handler = function(event, context) {

    console.log('pg-lambda-set-tiles-for-deal');
    console.log(event);

    dynamodb = dbUtils.getDynamoDB();

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

    function orderHands(tiles) {
        var sets = [
                new pgSet(tiles.slice(0,  4)),
                new pgSet(tiles.slice(4,  8)),
                new pgSet(tiles.slice(8, 12))
            ],
            sads = [
                sets[0].sumAndDiff(),
                sets[1].sumAndDiff(),
                sets[2].sumAndDiff()
            ],
            is, newTileIndexes;

        console.log('OrderHands');
        console.log(sads[0]);

        function switchSad(i) {
            var temp = sads[i];
            sads[i] = sads[i+1];
            sads[i+1] = temp;
        }
        if (sads[0].sum < sads[1].sum) switchSad(0);
        if (sads[1].sum < sads[2].sum) switchSad(1);
        if (sads[0].sum < sads[1].sum) switchSad(0);

        newTileIndexes = [];
        for (is = 0; is < 3; is++) {
            var pgSetTiles = sads[is].pgSet.tiles(), it;
            console.log('pgSetTiles:');
            console.log(pgSetTiles);
            for (it = 0; it < 4; it++) {
                newTileIndexes.push(pgSetTiles[it]._index);
            }
        }

        console.log('orderHands: newTileIndexes:');
        console.log(newTileIndexes);
        return newTileIndexes;
    }

    function orderTiles(tiles) {

        // Use strategy.
        var strategy = new pgStrategy(tiles);
        var bestSet = strategy.bestSet();
        var newTiles = bestSet.tiles();
        console.log('newTiles');
        console.log(newTiles);

        // Map the tiles as they are now to the tiles index; use
        // equality of tiles.
        var newTileIndexes = [], it;
        for (it = 0; it < newTiles.length; it++) {
            newTile = newTiles[it];
            for (var oti = 0; oti < tiles.length; oti++) {
                if (newTile === tiles[oti])
                    newTileIndexes.push(tiles[oti]._index);
            }
        }

        console.log('newTileIndexes');
        console.log(newTileIndexes);
        return newTileIndexes;
    }

    function setTilesForHand(tiles, ih) {
        var start = 12 + (ih * 4),
            handTiles = tiles.slice(start, start + 4);

        console.log('hand before setting:');
        console.log(handTiles);

        if (true) {
            handTiles = orderTiles(handTiles);
        } else {
            handTiles.sort(function(a, b) {
                return (a > b) ? 1 : ((a < b) ? -1 : 0);
            });
        }

        console.log('hand after setting:');
        console.log(handTiles);

        return handTiles;
    }

    function setTilesForDeal(deal) {
        console.log('computer tiles before sorting:');
        console.log(deal.tiles.slice(12, 24));

        // Make the three hands the best we can.
        var ih, computerHands = [], computerTiles;
        for (ih = 0; ih < 3; ih++) {
            computerHands.push(setTilesForHand(deal.tiles, ih));
        }

        // Sort the three hands
        computerTiles = computerHands[0]
            .concat(computerHands[1])
            .concat(computerHands[2]);
        console.log('concatenated computerTiles before ordering:');
        console.log(computerTiles);
        computerTiles = orderHands(computerTiles);
        console.log('concatenated computerTiles after ordering:');
        console.log(computerTiles);

        // Put the sorted tiles into the deal.
        Array.prototype.splice.apply(deal.tiles, [12, 12].concat(computerTiles));
        console.log('computer tiles after sorting:');
        console.log(deal.tiles.slice(12, 24));

        // Computer is always the opponent.
        deal.situation.opponent = 'TILES_ARE_SET';

        return deal;
    }

    // Actually do the work, now that all the functions have been created.
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

        // return dbUtils.putItem(dynamodb, 'deal', deal);
    })
    .then(function() {
        console.log('set-tiles success!');
        context.succeed(deal);
    })
    .fail(function(err) {
        console.log('set-tiles failure!');
        console.log(err);
        context.succeed(err);
    });
};
