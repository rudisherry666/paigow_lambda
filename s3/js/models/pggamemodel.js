/*
*
* @class PGGameModel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([
    'models/pgbasemodel'
],
function(
    PGBaseModel
) {
    
    var PGGameModel = PGBaseModel.extend({

        // Startup
        initialize: function(options) {

            this.set(this.defaults);
            this._addModelListeners();

            if (options.gameHash) this.set('gameHash', options.gameHash);
        },

        // A game is specific to a player.
        defaults: {
            'gameHash': null,
            'players': '',
            'situation': ''
        },

        _addModelListeners: function() {
            this.listenTo(this, 'change:gameHash', _.bind(this._fetchChanged, this));
        },

        _fetchChanged: function(model, newValue) {
            this.fetch();
        },

        // GameHash is the RESTful attribute in /game
        idAttribute: 'gameHash',
        urlPath: function() {
            return '/game/' + this.get('gameHash');
        },

    });

    return PGGameModel;
});
