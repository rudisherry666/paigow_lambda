var q = require('q'),
    utils = require('general-utils'),
    dbUtils = require('db-utils'),
    dynamodb;

exports.handler = function(event, context) {
    var response;

    console.log('pg-lambda-register-post');
    console.log(event);

    function validateRequest() {
        var defer = q.defer();
        if (event.action !== 'login' && event.action !== 'register') {
            console.log('bad action parameter');
            response = { error: 'Bad parameter', code: 'PG_ERROR_BAD_PARAMETERS_ACTION' };
            defer.reject(response);
        } else if (!event.username || !event.password) {
            console.log('bad parameters: no username or no password');
            response = { error: 'Bad parameter', code: 'PG_ERROR_BAD_PARAMETERS_USERNAME' };
            defer.reject(response);
        } else if (event.action === 'register' && !event.email) {
            console.log('bad parameters: no email with register');
            response = { error: 'Bad parameters', code: 'PG_ERROR_BAD_PARAMETERS_EMAIL' };
            defer.reject(response);
        } else {
            console.log('validateRequest success');
            defer.resolve();
        }

        return defer.promise;
    }

    // The attempt to retrieve an existing player with this username did not fail
    // or return gibberish, so see if it matches.
    function matchExistingPlayerOrNot(player) {
        var defer = q.defer(),
            response;
        console.log('matchExistingPlayerOrNot');

        // We need the password hash.
        var hash = utils.hashCode(event.password);

        if (player.username === event.username) {
            if (event.action === 'register') {
                // We found the username: see if the emal and password hash match;
                // if not, we return that the username is in use.  This is not actually
                // an error return, so we succeed with that info.
                if (player.email !== event.email || player.password !== hash) {
                    console.log('Cannot re-register ' + event.username);
                    response = { info: 'That username is already in use.  Please choose another', code: 'PG_RESPONSE_NAME_IN_USE' };
                    defer.reject(response);
                } else {
                    console.log('Register found existing player that matches, using it');
                    // This is the right player, use it.
                    defer.resolve(player);
                }
            } else {
                // Logging in: just the password needs to match.
                if (player.password !== hash) {
                    console.log('Cannot login, password does not match: ' + event.username);
                    response = { info: 'That username/password combination does not work.  Please try again', code: 'PG_RESPONSE_INVALID_LOGIN' };
                    defer.reject(response);
                } else {
                    console.log('Login found correct player, using it');
                    defer.resolve(player);
                }
            }

        } else if (event.action === 'login') {
            // They're logging in: no player, sorry.
            console.log('Cannot login, cannot find username: ' + event.username);
            response = { info: 'That username/password combination does not work.  Please try again', code: 'PG_RESPONSE_INVALID_LOGIN' };
            defer.reject(response);

        } else {
            console.log('Registering new user');

            // No player, set one up because they're registering
            player.username = event.username;
            player.password = hash;
            player.email = event.email;
            defer.resolve(player);
        }

        return defer.promise;
    }

    // This is an existing or new player: set up the session.
    function setupPlayerSession(player) {
        var check = q.defer(), defer = q.defer();
        console.log('setupPlayerSession');

        // If there is already a session, it must be an existing player and
        // we can set them logged in.
        if (player.sessionHash) {
            console.log('Player already in session ' + player.sessionHash + '; checking it...');
            dbUtils.getItem(dynamodb, 'session', 'sessionHash', player.sessionHash)
            .then(function(session) {
                if (session && session.sessionHash === player.sessionHash && session.username === player.username) {
                    console.log('Player session is here and good!');
                    check.resolve();
                } else {
                    console.log('Player session no good!');
                    delete player.sessionHash;
                    check.resolve();
                }
            })
            .fail(function(err) {
                console.log('Error trying to get session "' + player.sessionHash + '"');
                defer.reject(err);
            });
        } else {
            check.resolve();
        }

        check.promise.then(function() {
            // We've validated the sessionHash if it exists, removing it if
            // it's no good.  Now we can create the session if necessary.
            if (player.sessionHash) {
                defer.resolve(player);
            } else {
                console.log('Player needs new session, creating it');
                var session = {
                    sessionHash: utils.newRandomID(),
                    username: player.username
                };
                console.log(JSON.stringify(session));
                dbUtils.putItem(dynamodb, 'session', session)
                .then(function() {
                    player.sessionHash = session.sessionHash;
                    defer.resolve(player);
                })
                .fail(function(err) {
                    defer.reject(err);
                });
            }
        });

        return defer.promise;
    }

    // We have a player and a session: make sure the player is logged in.
    function loginPlayer(player) {
        console.log('loginPlayer');
        if (player.situation === 'LOGGED_IN') {
            loginSuccess(player);
            return;
        }

        player.situation = 'LOGGED_IN';

        console.log('loginPlayer logging in');
        dynamodb.putItem({
            TableName: 'player',
            Item: player
        },
        function(err, data) {

            if (err) {
                console.log('Cannot save player ' + event.username + ' logged-in state: ' + JSON.stringify(err));
                response = { error: 'Cannot log in ' + event.username + ' due to database error', code: 'PG_ERROR_DB_PUTITEM_PLAYER' };
                context.fail(response);
                return;
            }

            loginSuccess(player);
        });
    }

    function loginSuccess(player) {
        console.log('loginSuccess!');
        response = { info: 'Player ' + (event.action === "register" ? 'registered' : 'logged in'), paigow321: player.sessionHash, code: 'PG_RESPONSE_PLAYER_REGISTERED' };
        context.succeed(response);
    }

    // Actually do the work, now that all the functions have been created.
    validateRequest().then(function() {
        dynamodb = new (require('dynamodb-doc')).DynamoDB();
        return dbUtils.verifyDescribeTable(dynamodb, 'player');
    }).then(function() {
        return dbUtils.getItem(dynamodb, 'player', 'username', event.username);
    }).then(function(player) {
        return matchExistingPlayerOrNot(player || {});
    }).then(function(player) {
        return dbUtils.verifyDescribeTable(dynamodb, 'session', player);
    }).then(function(player) {
        return setupPlayerSession(player);
    }).then(function(player) {
        return loginPlayer(player);
    }).fail(function(err) {
        console.log('Failed: ' + JSON.stringify(err));
        context.fail(err);
    });
};
