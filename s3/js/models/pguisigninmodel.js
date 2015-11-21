/*
*
* @class pgplayermodel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([
    'models/pguimodel'
], function(
    PGUIModel
) {
    
    var PGUISigninModel = PGUIModel.extend({

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

    });

    return PGUISigninModel;
});
