/*
*
* @class pgplayermodel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define(['backbone'], function(Backbone) {

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
            var sessionHash = this.SESSION_HASH;
            if (sessionHash) {
                options = options || {};
                options.headers = options.headers || [];
                options.headers['X-PG-Session'] = sessionHash;
            }
            return options;
        },

    });

    return PGBaseModel;
});
