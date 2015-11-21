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
    'models/pgmodelmixin',
    'models/pggamemodel'
], function(
    Backbone,
    PGModelMixin,
    PGGameModel
) {
    
    var PGGamesCollection = Backbone.Collection.extend({

        // Startup
        initialize: function() {
            // Assume the worst: we don't know.
            this.set(this.defaults);

            // Fetch: maybe it will change.
            this.fetch();

            // When we've changed an we've synced,
            // then we're static again.
            this.on('sync', function() {
                console.log('synced!');
            });
        },

        defaults: {
            games: []
        },

        model: PGGameModel,

        urlPath: '/games'

    });

    PGModelMixin.mixin(PGGamesCollection.prototype, Backbone.Collection);

    return PGGamesCollection;
});
