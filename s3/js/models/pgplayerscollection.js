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
    'models/pgplayermodel'
], function(
    Backbone,
    config,
    PGModelMixin,
    PGPlayerModel
) {
    
    var PGPlayersCollection = Backbone.Collection.extend({

        model: PGPlayerModel,

        urlPath: '/players',

        mockFetchResponse: function() {
            return _.map(config.mockPlayers, function(player) { return { username: player.username, situation: player.situation }; });
        },

    });

    PGModelMixin.mixin(PGPlayersCollection.prototype, Backbone.Collection);

    return PGPlayersCollection;
});
