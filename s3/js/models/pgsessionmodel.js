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
    
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    var PGSessionModel = PGBaseModel.extend({

        // Startup
        initialize: function() {
            // Assume the worst: we don't know.
            this.set(this.defaults);

            // Get the sessionHash cookie if we have it, and if we do,
            // restore the session itself.  Fetch will trigger 'sync'
            // or 'error'.
            this.SESSION_HASH = getCookie('pg-session-hash');
            if (this.SESSION_HASH) {
                this.fetch();
            } else {
                this.trigger('nosync');
            }

            this.listenTo(this, 'sync', _.bind(function(data) {
                console.log('sync');
            }, this));
        },

        defaults: {
            'sessionHash': '',
            'username': '',
            'gameHash': ''
        },

        urlPath: '/session',

        login: function(playerModel) {
            var defer = $.Deferred(),
                data = _.extend(
                    _.pick(playerModel.attributes, 'username', 'password'), {
                        action: 'login'
                    }),
                ajaxOptions = {
                    url: this.urlRootBase + '/login',
                    method: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(data),
                    success: _.bind(function(data) {
                        this.SESSION_HASH = data.sessionHash;
                        document.cookie = 'pg-session-hash=' + data.sessionHash;
                        this.fetch();
                        defer.resolve();
                    }, this),
                    error: _.bind(function(data) {
                        console.log('cannot register');
                        defer.reject();
                    }, this)
                };

            this.addSessionHashHeader(ajaxOptions);
            $.ajax(ajaxOptions);

            return defer.promise();
        },

        register: function(username, password, email) {
            var defer = $.Deferred(),
                ajaxOptions = {
                    url: this.urlRootBase + '/login',
                    method: 'POST',
                    contentType: 'application/json;charset=UTF-8',
                    success: _.bind(function(data) {
                        this.SESSION_HASH = data.sessionHash;
                        document.cookie = 'pg-session-hash=' + data.sessionHash;
                        this.fetch();
                        defer.resolve();
                    }, this),
                    error: _.bind(function(data) {
                        console.log('cannot register');
                        defer.reject();
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

    });

    return PGSessionModel;
});
