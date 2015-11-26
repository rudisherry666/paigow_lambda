/*
*
* @class PGTileView
*
* A single tile.
*
*/

define([
    'classes/pgtile',
    'views/pgbaseview',
    'templates/pggameview'
], function(
    PGTile,
    PGBaseView,
    template
) {
    
    var PGPTileView = PGBaseView.extend({

        _addChildElements: function() {

            this.$el.append(_.template(template.tile)({}));

            this.$('.pgtile').addClass();

            return this._super();
        },

        _addConvenienceProperties: function() {
            var o = this._options;
            o.tile = new PGTile(this.tileIndex());

            this.$el.addClass(o.tile.divClass());

            return this._super();
        },

        // Convenience methods
        tileIndex: function() {
            var o = this._options,
                dModel = o.pgDealModel,
                indexInTilesOfDeal = (o.handIndex * 4) + o.tileIndex;
            return dModel.get('tiles')[indexInTilesOfDeal];
        },

        tile: function() {
            return this._options.tile;
        }

    });

    return PGPTileView;
});
