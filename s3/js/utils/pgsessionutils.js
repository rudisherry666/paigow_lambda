/*
*
* @class pgplayermodel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([
    'utils/config',
    'utils/pgbrowserutils'
], function(
    config,
    browserUtils
) {

    var SESSION_HASH;
    return {
        addSessionHashHeader: function(options) {
            if (SESSION_HASH) {
                options = options || {};
                options.headers = options.headers || {};
                options.headers['X-PG-Session'] = SESSION_HASH;
            }
            return options;
        },

        initializeSessionHash: function() {
            this.setSessionHash(browserUtils.getCookie('pg-session-hash'));
        },

        setSessionHash: function(sessionHash) {
            // For some reason the combination of lambda and API Gateway
            // is setting the cookie to "undefined".  Ignore it.
            if (sessionHash === "undefined") sessionHash = undefined;
            SESSION_HASH = sessionHash;
            if (SESSION_HASH) {
                document.cookie = 'pg-session-hash=' + sessionHash;
            } else {
                document.cookie = 'pg-session-hash=' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
        },

        getSessionHash: function() {
            return SESSION_HASH;
        }
    };
});
