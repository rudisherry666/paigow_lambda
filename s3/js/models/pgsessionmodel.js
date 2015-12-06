/*
*
* @class pgplayermodel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([
    'models/pgbasemodel'
], function(
    PGBaseModel
) {

    var PGSessionModel = PGBaseModel.extend({

        // Startup
        initialize: function() {
            // Assume the worst: we don't know.
            this.set(this.defaults);

            // Get the sessionHash cookie if we have it, and if we do,
            // restore the session itself.  Fetch will trigger 'sync'
            // or 'error'.
            this.initializeSessionHash();

            this.listenTo(this, 'sync', function(data) {
                this.get('eventBus').trigger('login');
            });

            this.listenTo(this, 'error', function(data) {
                this.get('eventBus').trigger('logout');
            });

            return this._super();
        },

        defaults: {
            'sessionHash': '',
            'username': '',
            'gameHash': ''
        },

        urlPath: '/session',

        startSession: function() {
            if (this.getSessionHash()) {
                this.fetch();
            } else {
                this.get('eventBus').trigger('logout');
            }
        },

        login: function(playerModel) {
            var defer = $.Deferred(),
                data = _.extend(
                    _.pick(playerModel.attributes, 'username', 'password'), {
                        action: 'login'
                    }),
                ajaxOptions = {
                    url: this.urlRoot + '/login',
                    method: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(data),
                    success: _.bind(function(data) {
                        console.log('Successful login');
                        this.setSessionHash(data.sessionHash);
                        this.set('sessionHash', data.sessionHash);
                        this.fetch();
                        defer.resolve();
                    }, this),
                    error: _.bind(function(data) {
                        console.log('login failed');
                        defer.reject();
                        // this.get('eventBus').trigger('logout');
                    }, this)
                };

            this.addSessionHashHeader(ajaxOptions);
            $.ajax(ajaxOptions);

            return defer.promise();
        },

        register: function(username, password, email) {
            var defer = $.Deferred(),
                ajaxOptions = {
                    url: this.urlRoot + '/login',
                    method: 'POST',
                    contentType: 'application/json;charset=UTF-8',
                    success: _.bind(function(data) {
                        console.log('Successful register');
                        this.setSessionHash(data.sessionHash);
                        this.set('sessionHash', data.sessionHash);
                        this.fetch();
                        defer.resolve();
                    }, this),
                    error: _.bind(function(data) {
                        console.log('register failed');
                        defer.reject();
                        // this.get('eventBus').trigger('logout');
                    }, this)
                };

            ajaxOptions.data = _.extend(
                    _.pick(playerModel.attributes, 'username', 'password'), {
                    action: 'register',
                    email: 'rudisherry666@gmail.com'
                });
            ajaxOptions.data = JSON.stringify(data);

            this.addSessionHashHeader(ajaxOptions);
            $.ajax(ajaxOptions);

            return defer.promise();
        },

        mockFetchResponse: {
            'sessionHash': 'session-hash-1',
            'username': 'rudi',
            'gameHash': 'game-hash-1'
        },

    });

    return PGSessionModel;
});
