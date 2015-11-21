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

            // Fetch: maybe it will change.
            this.fetch();

            // When we've changed an we've synced,
            // then we're static again.
            this.on('sync', function() {
                console.log('Games have been fetched!');
            });
        },

        model: PGGameModel,

        urlPath: '/games'

    });

    PGModelMixin.mixin(PGGamesCollection.prototype, Backbone.Collection);

    return PGGamesCollection;
});
