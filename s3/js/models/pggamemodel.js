/*
*
* @class PGGameModel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([
    'utils/config',
    'models/pgbasemodel'
],
function(
    config,
    PGBaseModel
) {
    
    var PGGameModel = PGBaseModel.extend({

        modelName: 'PGGameModel',

        // Startup
        initialize: function(options) {

            this.set(this.defaults);
            this._addModelListeners();

            if (options && options.gameHash) this.set('gameHash', options.gameHash);
        },

        // A game is specific to a player.
        defaults: {
            'gameHash': 'new-game',
            'players': '',
            'situation': '',
            'startTime': '',
            'score': [ -1, -1 ],
            'lastDealIndex': -1
        },

        _addModelListeners: function() {
            this.listenTo(this, 'change:gameHash', _.bind(this._hashChanged, this));
        },

        _hashChanged: function(model, newValue) {
            if (newValue !== this.defaults.gameHash)  {
                this.fetch();
            }
        },

        // GameHash is the RESTful attribute in /game
        idAttribute: 'gameHash',
        urlPath: function() {
            return '/game/' + this.get('gameHash');
        },

        // Convenience methods
        startTime: function() {
            var startTime = this.get('startTime');
            if (this.isNewGame()) return '';
            return startTime ? (new Date(startTime).toString()) : 'n/a';
        },

        score: function() {
            var score = this.get('score');
            if (this.isNewGame()) return '';
            return (score && score.join(' - ')) || "n/a";
        },

        opponent: function() {
            var players = this.get('players'),
                sModel = this.get('sessionModel'),
                playersArray;
            if (this.isNewGame()) return 'New Game';
            if (!players || !sModel) return 'n/a';
            playersArray = players.split('|');
            return playersArray[0] === sModel.get('username') ?
                playersArray[1] : playersArray[0];
        },

        isNewGame: function() {
            return (this.get('gameHash') === 'new-game');
        },

        mockFetchResponse: function() {
            var fetchedGame = {},
                hash = this.get('gameHash'),
                some = _.any(config.mockGames, function(game) {
                    if (game.gameHash !== hash) return false;
                    fetchedGame = game;
                    return true;
                });
            return fetchedGame;
        },

        classID: function() {
            return 'pg-games-row-hash-' + this.get('gameHash');
        }

    });

    return PGGameModel;
});
