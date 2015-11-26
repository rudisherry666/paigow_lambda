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
            return this._super();
        },

        _addConvenienceProperties: function() {
            var o = this._options;
            this.setTileIndex(this._origTileIndex());

            return this._super();
        },

        // Convenience methods
        _origTileIndex: function() {
            var o = this._options,
                dModel = o.pgDealModel,
                indexInTilesOfDeal = (o.handIndex * 4) + o.dealTileIndex;
            if (!o.isPlayer) indexInTilesOfDeal += 12;
            return dModel.get('tiles')[indexInTilesOfDeal];
        },

        // -------------------------------------------------------
        // Exported methods

        tileIndex: function() {
            return this._options.tileIndex;
        },

        setTileIndex: function(tileIndex) {
            var o = this._options,
                tile = new PGTile(tileIndex);

            o.tile = tile;
            o.tileIndex = tileIndex;
            this.$el.removeClass()
                .addClass('pgtile ' +
                    'pgtile-' + o.handIndex + '-' + o.dealTileIndex + ' ' +
                    tile.divClass());
        },

    });

    return PGPTileView;
});
