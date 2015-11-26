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
            this.tile = new PGTile(this._tileIndex());

            this.$el.addClass(this.tile.divClass());

            return this._super();
        },

        // Convenience methods
        _tileIndex: function() {
            var o = this._options,
                dModel = o.pgDealModel,
                indexInTilesOfDeal = (o.handIndex * 4) + o.tileIndex;
            return dModel.get('tiles')[indexInTilesOfDeal];
        }

    });

    return PGPTileView;
});
