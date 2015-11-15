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
    
    var PGSigninModel = PGBaseModel.extend({

        // Startup
        initialize: function() {
            // Assume the worst: we don't know.
            this.set(this.defaults);
        },

        defaults: {
            'username': 'unknown',
            'password': 'unknown',
            'state': 'static'
        },

        // This is not sync'ed with the server.
        fetch: function() {},
        save:  function() {},
        sync:  function() {}

    });

    return PGSigninModel;
});
