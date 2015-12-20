/*
*
* @class pgplayermodel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([
    'utils/config'
], function(
    config
) {

    var SESSION_HASH;
    function getCookie(name) {
        var value = config.mock ? config.mockCookie : ("; " + document.cookie);
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
                    if (config.mock) {
                        if (this.mockFetchResponse) {
                            _.defer(_.bind(function() {
                                var response = _.result(this, 'mockFetchResponse');
                                this.set(response);
                                if (options && options.success) {
                                    options.success(response);
                                }
                                this.trigger('sync', this, response, {
                                    mock: true
                                });
                            }, this));
                        } else {
                            console.log('Mock fetch without fetch response!');
                        }
                    } else {
                        options = this.addSessionHashHeader(options);
                        superclass.prototype.fetch.call(this, options);
                    }
                },
                sync: function(method, model, options) {
                    if (config.mock) {
                        console.log('Mock sync -- should not be called!');
                    } else {
                        options = this.addSessionHashHeader(options);
                        superclass.prototype.sync.call(this, method, model, options);
                    }
                },
                save: function(key, val, options) {
                    if (config.mock) {
                        console.log('Mock save -- should not be called!');
                    } else {
                        if (typeof key === 'string') {
                            // params are (key, val, [options])
                            options = this.addSessionHashHeader(options);
                        } else if (_.isUndefined(val)) {
                            // params are (options), use 'key'
                            key = this.addSessionHashHeader(key);
                        } else {
                            // params are (attributes, options), use 'val'
                            val = this.addSessionHashHeader(val);
                        }
                        superclass.prototype.save.call(this, key, val, options);
                    }
                },

                addSessionHashHeader: function(options) {
                    if (SESSION_HASH) {
                        options = options || {};
                        options.headers = options.headers || {};
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
