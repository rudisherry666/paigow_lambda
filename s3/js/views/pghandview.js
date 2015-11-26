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

        // -------------------------------------------------------
        // Superclass overrides

        _addModels: function() {
            var o = this._options;

            o.pgHandUIModel = new PGHandUIModel({
                handIndex: o.handIndex,
            });

            return this._super();
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options,
                h = o.pgHandUIModel;

            this.listenTo(h, 'change:tileIndexes', this._tilesChanged);
            this.listenTo(h, 'hand:previewed', this._previewHand);
            this.listenTo(h, 'hand:unpreviewed', this._unpreviewHand);

            return this._super();
        },

        events: {
            'click .rotatetiles-btn': "_rotateTiles"
        },

        // Show our view when asked.
        _addChildElements: function() {
            var o = this._options,
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
                    dealTileIndex: tvi,
                });
                o.pgTileViews.push(pgTileView);
            }

            _.each(o.pgTileViews, function(pgTileView) {
                pgTileView.render();
                tileIndexes.push(pgTileView.tileIndex());
            });

            o.pgHandUIModel.set('tileIndexes', tileIndexes);

            return this._super();
        },

        // -------------------------------------------------------
        // Handlers

        _rotateTiles: function(e) {
            var o = this._options,
                h = o.pgHandUIModel,
                tileIndexes = this._rotatedArray(h.get('tileIndexes'));

            // Switch around our hand's tiles; we have to switch
            // the views array and their DOM elements.
            h.set('tileIndexes', tileIndexes);
        },

        _previewHand: function() {
            var twoTile = this.$('.pg2tile>div')[1];
            PGBrowserUtils.animateRotate($(twoTile), 0, 90);
        },

        _unpreviewHand: function() {
            var twoTile = this.$('.pg2tile>div')[1];
            PGBrowserUtils.animateRotate($(twoTile), 90, 0);
        },

        // -------------------------------------------------------
        // Convenience methods

        _rotatedArray: function(a) {
            return new Array(a[0], a[2], a[3], a[1]);
        },

        _tileIndexOfTile: function(index) {
            return this._options.pgTileViews[index].tileIndex();
        },

        _tilesChanged: function() {
            var o = this._options,
                tileIndexes = this.tileIndexes();

            _.each(o.pgTileViews, function(pgTileView, index) {
                pgTileView.setTileIndex(tileIndexes[index]);
            });

            // Update the label by figuring out the hand names.
            var highHand = new PGHand(
                    this._tileIndexOfTile(0),
                    this._tileIndexOfTile(1)),
                lowHand = new PGHand(
                    this._tileIndexOfTile(2),
                    this._tileIndexOfTile(3)),
                $labels = this.$('.pg2tile-label');
            $($labels[0]).text(highHand.name());
            $($labels[1]).text(lowHand.name());
        },

        // -------------------------------------------------------
        // Exported methods

        tileIndexes: function() {
            return this._options.pgHandUIModel.get('tileIndexes');
        },

        setTileIndexes: function(tileIndexes) {
            this._options.pgHandUIModel.set('tileIndexes', tileIndexes);
        }
    });

    return PGHandView;
});
