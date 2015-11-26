/*
*
* @class PGHandView
*
* This file controls the signing or register view on the main page.
*/

define([
    'views/pgbaseview',
    'models/ui/pghanduimodel',
    'views/pgtileview',
    'templates/pggameview'
], function(
    PGBaseView,
    PGHandUIModel,
    PGTileView,
    template
) {
    
    var PGHandView = PGBaseView.extend({

        _addModels: function() {
            var o = this._options;

            o.pgHandUIModel = new PGHandUIModel({
                handIndex: o.handIndex,
            });

            return this._super();
        },

        events: {
            'click .rotatetiles-btn': "_rotateTiles"
        },

        // Show our view when asked.
        _addChildElements: function() {
            var o = this._options,
                tiles = [],
                tileIndexes = [];

            this.$el.append(_.template(template.hand)({
                handName: 'handName'
            }));

            // There are four tiles.
            o.pgTileViews = [];
            for (var tvi = 0; tvi < 4; tvi++) {
                var pgTileView = new PGTileView({
                    el: this.$('.pgtile')[tvi],
                    eventBus: o.eventBus,
                    pgDealModel: o.pgDealModel,
                    isPlayer: o.isPlayer,
                    handIndex: o.handIndex,
                    tileIndex: tvi,
                });
                o.pgTileViews.push(pgTileView);
            }

            _.each(o.pgTileViews, function(pgTileView) {
                pgTileView.render();
                tileIndexes.push(pgTileView.tileIndex());
                tiles.push(pgTileView.tile());
            });

            o.pgHandUIModel.set({
                tileIndexes: tileIndexes,
                tiles: tiles
            }, { silent: true });

            return this._super();
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options,
                h = o.pgHandUIModel;

            this.listenTo(h, 'change:tiles', this._tilesChanged);
            this.listenTo(h, 'hand:previewed', this._previewHand);
            this.listenTo(h, 'hand:unpreviewed', this._unpreviewHand);

            return this._super();
        },

        _tilesChanged: function() {
            var o = this._options,
                h = o.pgHandUIModel;

            // Change the tile classes.
            var $tiles = this.$('.pgtile');
            var tiles = h.get('tiles');
            for (var ti = 0; ti < 4; ti++) {
                var tile = (tiles && tiles[ti]) || null;
                var divClass = (tile && tile.divClass()) || "";
                var $tile = $($tiles[ti]);
                $tile.removeClass();
                $tile.addClass('pgtile pgtile-' + h.get('handIndex') + '-' + ti + ' ' + divClass);
            }

            // Update the label.
            var $labels = this.$('.pg2tile-label');
            var highHand = new PGHand(tiles[0], tiles[1]);
            var lowHand = new PGHand(tiles[2], tiles[3]);
            $($labels[0]).text(highHand.name());
            $($labels[1]).text(lowHand.name());
        },

        _rotateTiles: function(e) {
            var o = this._options,
                h = o.pgHandUIModel;

            // Switch around our hand's tiles: third tile goes second,
            // fourth goes third, second goes fourth.
            var tileIndexes = h.get('tileIndexes');
            h.set('tileIndexes', [ tileIndexes[0], tileIndexes[2], tileIndexes[3], tileIndexes[1] ]);
            this._tilesChanged();
        },

        _previewHand: function() {
            var twoTile = this.$('.pg2tile>div')[1];
            PGBrowserUtils.animateRotate($(twoTile), 0, 90);
        },

        _unpreviewHand: function() {
            var twoTile = this.$('.pg2tile>div')[1];
            PGBrowserUtils.animateRotate($(twoTile), 90, 0);
        },

    });

    return PGHandView;
});
