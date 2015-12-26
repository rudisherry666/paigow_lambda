/*
* @class pgsessionutils
*
* Utilities for managing the cookie-based session.
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
        sesssionCookieName: 'X-PG-Session',

        addSessionHashHeader: function(options) {
            if (SESSION_HASH) {
                options = options || {};
                options.headers = options.headers || {};
                options.headers['X-PG-Session'] = SESSION_HASH;
            }
            return options;
        },

        initializeSessionHash: function() {
            this.setSessionHash(browserUtils.getCookie(this.sesssionCookieName));
        },

        setSessionHash: function(sessionHash) {
            // For some reason the combination of lambda and API Gateway
            // is setting the cookie to "undefined".  Ignore it.
            if (sessionHash === "undefined") sessionHash = undefined;
            SESSION_HASH = sessionHash;
            if (SESSION_HASH) {
                document.cookie = this.sesssionCookieName + '=' + sessionHash;
            } else {
                document.cookie = this.sesssionCookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
        },

        getSessionHash: function() {
            return SESSION_HASH;
        }
    };
});
