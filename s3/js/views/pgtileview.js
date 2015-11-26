/*
*
* @class PGTileView
*
* A single tile.
*
*/

define([
    'views/pgbaseview',
    'templates/pggameview'
], function(
    PGBaseView,
    template
) {
    
    var PGPTileView = PGBaseView.extend({

        _addChildElements: function() {

            this.$el.append(_.template(template.tile)({}));

            return this._super();
        },

    });

    return PGPTileView;
});
