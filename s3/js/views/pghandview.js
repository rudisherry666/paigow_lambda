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
                pgDealModel: o.pgDealModel,
                isPlayer: o.isPlayer,
                index: o.index,
            });

            return this._super();
        },

        events: {
            'click .rotatetiles-btn': "_rotateTiles"
        },

        // Show our view when asked.
        _addChildElements: function() {
            var o = this._options;

            this.$el.append(_.template(template.hand)({
                handName: 'handName',
                tileClass1: 'tileClass1',
                tileClass2: 'tileClass2',
                tileClass3: 'tileClass3',
                tileClass4: 'tileClass4',
            }));

            // There are four tiles.
            o.pgTileViews = [];
            for (var tvi = 0; tvi < 3; tvi++) {
                o.pgTileViews.push(new PGTileView({
                    el: this.$('.pghand')[tvi],
                    eventBus: o.eventBus,
                    index: tvi,
                }));
            }

            _.each(o.pgTileViews, function(tileView) {
                tileView.render();
            });

            return this._super();
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options;

            this.listenTo(o, 'change:tiles', this._tilesChanged);
            this.listenTo(o, 'hand:previewed', this._previewHand);
            this.listenTo(o, 'hand:unpreviewed', this._unpreviewHand);

            return this._super();
        },

        _tilesChanged: function() {
            // Change the tile classes.
            var $tiles = this._$hand.find('.pgtile');
            var tiles = this._handModel.get('tiles');
            for (var ti = 0; ti < 4; ti++) {
                var tile = (tiles && tiles[ti]) || null;
                var divClass = (tile && tile.divClass()) || "";
                var $tile = $($tiles[ti]);
                $tile.removeClass();
                $tile.addClass('pgtile pgtile-' + this._index + '-' + ti + ' ' + divClass);
            }

            // Update the label.
            var $labels = this._$hand.find('.pg2tile-label');
            var highHand = new PGHand(tiles[0], tiles[1]);
            var lowHand = new PGHand(tiles[2], tiles[3]);
            $($labels[0]).text(highHand.name());
            $($labels[1]).text(lowHand.name());
        },

        _rotateTiles: function(e) {
            // Switch around our hand's tiles: third tile goes second,
            // fourth goes third, second goes fourth.
            var tileIndexes = this._handModel.get('tile_indexes');
            this._handModel.set('tile_indexes', [ tileIndexes[0], tileIndexes[2], tileIndexes[3], tileIndexes[1] ]);
            this._tilesChanged();
        },

        _previewHand: function() {
            var twoTile = this._$hand.find('.pg2tile>div')[1];
            PGBrowserUtils.animateRotate($(twoTile), 0, 90);
        },

        _unpreviewHand: function() {
            var twoTile = this._$hand.find('.pg2tile>div')[1];
            PGBrowserUtils.animateRotate($(twoTile), 90, 0);
        },

    });

    return PGHandView;
});
