/*
*
* @class pggamescollection
*
* This file defines the pggames js class on the client
*
* This has a collection of all the games we know of
*/

define([
    'backbone',
    'utils/config',
    'models/pgmodelmixin',
    'models/pggamemodel'
], function(
    Backbone,
    config,
    PGModelMixin,
    PGGameModel
) {
    
    var PGGamesCollection = Backbone.Collection.extend({

        // Startup
        initialize: function() {

            // // Fetch: maybe it will change.
            // this.fetch();

            // When we've changed an we've synced,
            // then we're static again.
            this.on('sync', function() {
                console.log('Games have been fetched!');
            });
        },

        parse: function(data) {
            var vals = this._super(data);
            vals.unshift({gameHash: 'new-game'});
            return vals;
        },

        model: PGGameModel,

        urlPath: '/games',

        mockFetchResponse: function() {
            return _.map(config.mockGames, function(game) { return { gameHash: game.gameHash }; });
        }

    });

    PGModelMixin.mixin(PGGamesCollection.prototype, Backbone.Collection);

    return PGGamesCollection;
});
