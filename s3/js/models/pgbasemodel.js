/*
*
* @class pgplayermodel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define(['backbone'], function(Backbone) {

    var SESSION_HASH;
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    var PGBaseModel = Backbone.Model.extend({

        // Filled in by subclass PGSessionModel.
        // SESSION_HASH: 'jfzcnrwnllfrznisffdeb',
        SESSION_HASH: undefined,

        // Subclasses just use urlPath, we set the root.
        urlRootBase: 'https://4lsjp8j9ji.execute-api.us-west-2.amazonaws.com/test',
        urlRoot: function() {
            return this.urlRootBase + this.urlPath;
        },

        // Override the various server comm to add the correct header.
        fetch: function(method, model, options) {
            options = this.addSessionHashHeader(options);
            Backbone.Model.prototype.fetch.call(this, method, model, options);
        },
        sync: function(method, model, options) {
            options = this.addSessionHashHeader(options);
            Backbone.Model.prototype.sync.call(this, method, model, options);
        },
        save: function(method, model, options) {
            options = this.addSessionHashHeader(options);
            Backbone.Model.prototype.save.call(this, method, model, options);
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
            SESSION_HASH = sessionHash;
            document.cookie = 'pg-session-hash=' + sessionHash;
        },

        getSessionHash: function() {
            return SESSION_HASH;
        }

    });

    return PGBaseModel;
});
