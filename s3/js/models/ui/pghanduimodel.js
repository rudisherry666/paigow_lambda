/*
*
* @class PGHandModel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([
    'models/ui/pguimodel',
    'classes/pghand',
    'classes/pgstrategy'
], function(
    PGUIModel,
    PGHand,
    PGStrategy
) {
    
    var PGHandUIModel = PGUIModel.extend({

        // Startup
        initialize: function(options) {
            return this._super();
        },

        // A hand is specific to a player in a game, and is
        // some round in the game.
        defaults: {
        },

        _resetTiles: function() {
            var tileIndexes = this.get('tile_indexes');
            var tiles = [
                this._deckModel.tileOf(tileIndexes[0]),
                this._deckModel.tileOf(tileIndexes[1]),
                this._deckModel.tileOf(tileIndexes[2]),
                this._deckModel.tileOf(tileIndexes[3])
            ];

            // First time when we set the tiles it sends out a notification
            // since it wasn't set at all; subsequently it doesn't because
            // it doesn't recognize array differences.  Set it to silent and
            // manually notify (below) so we do the same thing every time.
            this.set('tiles', tiles, {silent:true});
            this.trigger('change:tiles');
        },

        pgSet: function() {
            var tiles = this.get('tiles');
            return new PGSet(tiles[0], tiles[1], tiles[2], tiles[3]);
        },

        orderTiles: function(options) {
            if (!this.inOrderTiles) {
                var tiles = this.get('tiles');
                var tileIndexes = this.get('tile_indexes').slice(0);

                // Use strategy.
                var strategy = new PGStrategy(tiles);
                var bestSet = strategy.bestSet();
                var newTiles = bestSet.tiles();

                console.log("" + bestSet + " is chosen as only way");

                // Map the tiles as they are now to the tiles index; use
                // equality of tiles.
                var newTileIndexes = [];
                _.each(newTiles, function(newTile) {
                    for (var oti = 0; oti < tiles.length; oti++) {
                        if (newTile === tiles[oti])
                            newTileIndexes.push(tileIndexes[oti]);
                    }
                });

                this.inOrderTiles = true;
                this.set('tile_indexes', newTileIndexes);
                this.inOrderTiles = false;
            }
        }

    });

    return PGHandUIModel;
});
