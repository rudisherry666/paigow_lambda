var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    pg = require('pg'),
    dynamodb, session;

exports.handler = function(event, context) {
    var response;

    // Set below
    var session, player, opponent, game, deal;

    console.log('pg-lambda-deal-put');
    console.log(event);

    function validateRequest() {
        var defer = q.defer(),
            dealIndex = -1;
        if (!event.gameHash) {
            defer.reject({
                error: 'No gameHash supplied for putting deal',
                code: 'PG_ERROR_MISSING_GAME_HASH_PARAMETER'
            });
        } else if (!event.dealIndex) {
            defer.reject({
                error: 'No dealIndex supplied for putting deal',
                code: 'PG_ERROR_MISSING_DEAL_INDEX_PARAMETER'
            });
        } else if (!event.player) {
            defer.reject({
                error: 'No player supplied for putting deal',
                code: 'PG_ERROR_MISSING_PLAYER_PARAMETER'
            });
        } else if (event.player !== "player") {
            defer.reject({
                error: 'Bad player supplied for putting deal',
                code: 'PG_ERROR_BAD_PLAYER_PARAMETER'
            });
        } else if (!event.state) {
            defer.reject({
                error: 'No state supplied for putting deal',
                code: 'PG_ERROR_MISSING_STATE_PARAMETER'
            });
        } else if (["tiles_are_set", "ready_for_next_deal"].indexOf(event.state) < 0) {
            defer.reject({
                error: 'Bad state supplied for putting deal',
                code: 'PG_ERROR_BAD_STATE_PARAMETER'
            });
        } else if (event.action == "tiles_are_set" &&
                   (!event.tiles ||
                    !event.tiles.length ||
                    !(event.tiles instanceof Array) ||
                    (event.tiles.length < 12))) {
            console.log(event.tiles);
            console.log(event.tiles.length);
            console.log(typeof event.tiles);
            defer.reject({
                error: 'Bad tiles supplied for putting tiles_are_set to deal',
                code: 'PG_ERROR_BAD_TILES_PARAMETER'
            });
        } else {
            console.log('Request validated');
            defer.resolve();
        }
        return defer.promise;
    }

    function arraysNumbersMatch(a, b) {
        a.sort();
        b.sort();
        console.log('matching:');
        console.log(a.toString());
        console.log(b.toString());
        for (i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                console.log('no match!');
                return false;
            }
        }
        console.log('match!');
        return true;
    }

    function sum(prev, cur, index, array) {
        return prev + cur;
    }
    function sortHands(h1, h2) {
        var s1 = h1.reduce(sum),
            s2 = h2.reduce(sum);

        console.log('array length: ', h1.length);
        console.log('s1: ' + s1, '; s2: ' + s2);

        // Add up all the indexes, sort by that.
        if (s1 > s2)
            return 1;
        if (s1 < s2)
            return -1;

        // The sum of the indexes are the same.  Remove the last tile and
        // sort by the sum again.
        if (h1.length > 1)
            return sortHands(h1.slice(0, h1.length-1), h2.slice(0, h2.length-1));

        // We have only one tile left and it's the same: the two hands are
        // identical so it doesn't matter which one.  Return equal.
        return 0;
    }

    // Verify that the tiles in the event match those in the deal.
    function checkTiles(dt, et) {
        var defer = q.defer(), i;
        dealTiles = dt.slice(0, 12);
        eventTiles = et.slice(0, 12);

        // First check: all the same tiles: make sure the user didn't
        // replace some tile with their own.
        if (!arraysNumbersMatch(dealTiles, eventTiles)) {
            defer.reject({
                error: 'Set tiles include tiles other than those dealt',
                code: 'PG_ERROR_MISMATCHED_TILES_PARAMETER'
            });
            return defer.promise;
        }

        // Check each hand.  We don't know which order the hands are
        // in so we separate into 4-tile hands from each then sort
        // the tiles within.
        var d = [
                dt.slice(0, 4),
                dt.slice(4, 8),
                dt.slice(8, 12)
            ],
            e = [
                et.slice(0, 4),
                et.slice(4, 8),
                et.slice(8, 12)
            ];
        d.sort(sortHands);
        e.sort(sortHands);

        // Theoretically now, d and e should be identical.
        for (i = 0; i < 3; i++) {
            if (!arraysNumbersMatch(d[i], e[i])) {
                defer.reject({
                    error: 'Set hands have tiles from other hands',
                    code: 'PG_ERROR_MISMATCHED_HANDS_PARAMETER'
                });
                return defer.promise;
            }
        }

        // Everything went well.
        defer.resolve();

        return defer.promise;
    }

    function setTiles(dbDeal) {
        return checkTiles(dbDeal.tiles, event.tiles)
        .then(function() {
            // Update the deal with the tiles we're given, and set the
            // situation correctly.
            // TODO: make sure that the tiles in the event are a legal
            // re-arrangement of the original deal's tiles.
            Array.prototype.splice.apply(dbDeal.tiles, [0, 12].concat(event.tiles.slice(0,12)));
            dbDeal.tiles.slice(event.tiles, 0, 12);
            dbDeal.situation = "TILES_ARE_SET";
            console.log('spliced tiles in');
            console.log(dbDeal);
            deal = dbDeal;
            return dbUtils.putItem(dynamodb, 'deal', deal);
        });
    }

    function addAnotherDeal() {
        var defer = q.defer();
        
        dbDeal.situation = "DONE";
        dbUtils.putItem(dynamodb, 'deal', deal)
        .then(function() {
            console.log('Deal is done, creating new deal');
            deal = pg.newDeal(event.gameHash, event.dealIndex + 1);

            // This goes in several steps.
            console.log(deal);

            return dbUtils.putItem(dynamodb, 'deal', deal);
        })
        .then(function() {
            console.log('New deal is saved, updating game');
            return dbUtils.getItem(dynamodb, 'game', 'gameHash', event.gameHash);
        })
        .then(function(game) {
            console.log('Got game for deal, updating deal index');
            game.lastDealIndex = deal.dealIndex;
            return dbUtils.putItem(dynamodb, 'game', game);
        })
        .then(function() {
            console.log('addAnotherDeal succeeded.');
            defer.resolve();
        })
        .fail(function(err) {
            console.log('addAnotherDeal failed');
            console.log(err);
            defer.reject(err);
        });

        return defer.promise;
    }

    // Actually do the work, now that all the functions have been created.
    dynamodb = new (require('dynamodb-doc')).DynamoDB();
    validateRequest()
    .then(function() {
        return dbUtils.validateSession(dynamodb, event.sessionHash);
    })
    .then(function() {
        console.log('validated Session');
        var dealID = event.gameHash + '#' + event.dealIndex;
        console.log('Getting deal with ID: ' + dealID);
        return dbUtils.getItem(dynamodb, 'deal', 'dealID', dealID);
    })
    .then(function(dbDeal) {
        console.log('got deal');
        console.log(dbDeal);

        // Depending on the payload, we update the deal.
        if (event.state === 'tiles_are_set') {
            return setTiles(dbDeal);
        } else if (event.state === 'ready_for_next_deal') {
            return addAnotherDeal(dbDeal);
        }
    })
    .then(function() {
        // All success! Return the game ID.
        console.log('deal-put success!');
        context.succeed(deal);
    })
    .fail(function(err) {
        console.log('deal-put failed!');
        console.log(err);
        // TODO: if writing some stuff failled, we have to back out.
        // i.e. make it transaction based.
        context.succeed(err);
    });
};
