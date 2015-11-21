/*
*
* @class pgplayermodel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([], function(Backbone) {

    var SESSION_HASH;
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    return {

        mixin: function(obj, superclass) {
            _.extend(obj, {

                // Subclasses just use urlPath, we set the root.
                urlRoot: 'https://4lsjp8j9ji.execute-api.us-west-2.amazonaws.com/test',
                url: function() {
                    return this.urlRoot + _.result(this, 'urlPath');
                },

                // Override the various server comm to add the correct header.
                fetch: function(options) {
                    options = this.addSessionHashHeader(options);
                    superclass.prototype.fetch.call(this, options);
                },
                sync: function(method, model, options) {
                    options = this.addSessionHashHeader(options);
                    superclass.prototype.sync.call(this, method, model, options);
                },
                save: function(method, model, options) {
                    options = this.addSessionHashHeader(options);
                    superclass.prototype.save.call(this, method, model, options);
                },

                addSessionHashHeader: function(options) {
                    if (SESSION_HASH) {
                        options = options || {};
                        options.headers = options.headers || [];
                        options.headers['X-PG-Session'] = SESSION_HASH;
                    }
                    return options;
                },

                initializeSessionHash: function() {
                    this.setSessionHash(getCookie('pg-session-hash'));
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
            });
        }
    };
});
