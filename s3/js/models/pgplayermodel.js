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
    
    var PGPlayerModel = PGBaseModel.extend({

        modelName: 'PGPlayerModel',

        // Startup
        initialize: function() {
            // When we've changed an we've synced,
            // then we're static again.
            this.on('sync', function() {
                this.set('state', 'static');
            });
        },

        defaults: {
            'username': 'unknown',
            'password': 'unknown',
            'situation': 'UNKNOWN'
        },

        urlPath: '/player',

        mockFetchResponse: function() {
            return {
                'username': 'rudi',
                'password': '*',
                'situation': 'LOGGED_IN',
                'sessionHash': 'session-hash-1'
            };
        }
    });

    return PGPlayerModel;
});
