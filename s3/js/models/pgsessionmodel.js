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

            document.cookie = 'sessionHash=jfzcnrwnllfrznisffdeb';

            // Get the sessionHash cookie if we have it, and if we do,
            // restore the session itself.  Fetch will trigger 'sync'
            // or 'error'.
            if (this.SESSION_HASH) {
                this.fetch();
            } else {
                this.trigger('nosync');
            }
        },

        defaults: {
            'sessionHash': '',
            'username': '',
            'gameHash': '',
            'action': ''
        },

        urlPath: '/session',

        login: function() {
            this.set('action', 'login');
            this.save();
        },

        register: function() {
            this.set('action', 'register');
            this.save();
        },

    });

    return PGSessionModel;
});
