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
    'utils/pgbrowserutils',
    'utils/pgsessionutils'
], function(
    config,
    browserUtils,
    sessionUtils
) {

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
                        options = sessionUtils.addSessionHashHeader(options);
                        superclass.prototype.fetch.call(this, options);
                    }
                },
                sync: function(method, model, options) {
                    if (config.mock) {
                        console.log('Mock sync -- should not be called!');
                    } else {
                        options = sessionUtils.addSessionHashHeader(options);
                        superclass.prototype.sync.call(this, method, model, options);
                    }
                },
                save: function(key, val, options) {
                    if (config.mock) {
                        console.log('Mock save -- should not be called!');
                    } else {
                        if (typeof key === 'string') {
                            // params are (key, val, [options])
                            options = sessionUtils.addSessionHashHeader(options);
                        } else if (_.isUndefined(val)) {
                            // params are (options), use 'key'
                            key = sessionUtils.addSessionHashHeader(key);
                        } else {
                            // params are (attributes, options), use 'val'
                            val = sessionUtils.addSessionHashHeader(val);
                        }
                        superclass.prototype.save.call(this, key, val, options);
                    }
                }
            });
        }
    };
});
