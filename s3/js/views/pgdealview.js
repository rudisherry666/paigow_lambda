/*
*
* @class PGDealView
*
* This file controls what is seen for a single player's 3 hands.
*/

define([
    'views/pgbaseview',
    'models/ui/pgdealuimodel',
    'views/pghandview',
    'templates/pggameview'
], function(
    PGBaseView,
    PGDealUIModel,
    PGHandView,
    template
) {
    
    var PGDealView = PGBaseView.extend({

        // -------------------------------------------------------
        // Superclass overrides

        events: {
            'click .pgswitchhands-btn'        : "_switchHands",
            'click .pg-deal-preview-hands'    : "_previewHands",
            'click .pg-deal-un-preview-hands' : "_unPreviewHands",
            'click .pg-deal-tiles-are-set'    : "_tilesAreSet",
            'click .pg-deal-next-deal'        : "_nextDeal",
            'click .pg-deal-another-game'     : "_anotherGame"
        },

        _addModels: function() {
            var o = this._options;
            o.pgDealUIModel = new PGDealUIModel({
                pgDealModel: this.pgDealModel
            });

            return this._super();
        },

        // If there is no signin, then show the view.
        _addChildElements: function() {
            var o = this._options;

            this.$el.append(_.template(template.deal)({}));

            // There are three hands, each with a model.
            o.pgHandViews = [];
            for (var hvi = 0; hvi < 3; hvi++) {
                o.pgHandViews.push(new PGHandView({
                    el: this.$('.pghand')[hvi],
                    eventBus: o.eventBus,
                    pgDealModel: o.pgDealModel,
                    pgDealUIModel: o.pgDealUIModel,
                    isPlayer: o.isPlayer,
                    handIndex: hvi,
                }));
            }

            _.each(o.pgHandViews, function(pgHandView) {
                pgHandView.render();
            });

            // We start with 'thinking'.
            if (o.isPlayer) {
                this._setClass('pg-deal-thinking');
            } else {
                this._setClass('pg-deal-opponent pg-hidden-hands');
            }

            return this._super();
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options;

            if (o.isPlayer) {
                // If the situation changes as a result of clicking one of the buttons,
                // update the state of the buttons.
                this.listenTo(o.pgDealUIModel, 'change:situation',
                    this._onDealSituationChange);

                this.listenTo(o.eventBus, 'deal:tiles_are_set', this._onTilesSet);
            } else {
                this.listenTo(o.pgDealModel, 'sync', this._onDealSync);
            }

            return this._super();
        },

        // -------------------------------------------------------
        // Handlers

        _switchHands: function(e) {
            var whichHand = parseInt($(e.target).attr('data-handindex'), 10);
            this._switchHandsEx(whichHand);
        },

        // User clicked 'Preview Handls'
        _previewHands: function(e) {
            this._setDealSituation('previewing');
        },

        _unPreviewHands: function(e) {
            this._setDealSituation('thinking');
        },

        _tilesAreSet: function(e) {
            this._setDealSituation('tiles_are_set');
        },

        _nextDeal: function(e) {
            this._setDealSituation('ready_for_next_deal');
        },

        _anotherGame: function(e) {
            this._setDealSituation('ready_for_next_game');
        },

        _onDealSituationChange: function(model, newSituation) {
            var o = this._options;
            switch (newSituation) {
                case 'tiles_are_set':
                    this._setClass('pg-deal-tiles-are-set');
                    o.eventBus.trigger('deal:tiles_are_set');
                break;
                case "thinking":
                    this._setClass('pg-deal-thinking');
                    this.$el.removeClass('pg-no-manipulate pg-hidden-hands');
                break;
                case "previewing":
                    this._setClass('pg-deal-previewing');
                    this.$el.addClass('pg-no-manipulate');
                break;

                case "ready_for_next_deal":
                    this._setClass('pg-deal-ready_for_next_deal');
                    this.$el.addClass('pg-no-manipulate pg-hidden-hands');
                    o.eventBus.trigger('deal:ready_for_next_deal');
                break;

                case "ready_for_next_game":
                    this._setClass('pg-deal-ready_for_next_game');
                    this.$el.addClass('pg-no-manipulate pg-hidden-hands');
                    o.eventBus.trigger('deal:ready_for_next_game');
                break;
            }
        },

        _onTilesSet: function() {
            var o = this._options,
                tileIndexes = o.pgHandViews.reduce(function(prev, cur) {
                    return prev.concat(cur.tileIndexes());
                }, []);

            o.pgDealModel.set({
                tiles: tileIndexes,
                situation: o.pgDealUIModel.get('situation')
            }).save({}, {
                success: _.bind(function(model, response, options) {
                    // The tiles hav been updated, during 'save', with the
                    // actual opponent's tiles -- if the opponent is ready.
                    // We know the opponent is ready because the deal situate
                    // will be 'FINISHED'.
                    if (model.get('situation') === 'FINISHED') {

                    } else {
                        // TODO: if the opponent is not ready we need to poll
                        // until (s)he is.
                    }
                }, this),
                error: _.bind(function(model, response, options) {
                    console.log(response);
                }, this),
            });
        },

        _onDealSync: function(model, deal) {
            var o = this._options;

            if (deal.situation === 'FINISHED') {
                // Make sure we can shown the tiles.
                this.$el.removeClass('pg-hidden-hands');

                // Reset the tile indexes for the hands.
                _.each(o.pgHandViews, function(pgHandView, index) {
                    pgHandView.setTileIndexes(deal.tiles.slice(12+(index*4), 12+((index+1)*4)));
                });
            }
        },

        // -------------------------------------------------------
        // Convenience methods

        _setClass: function(newClass) {
            this.$el.removeClass('pg-deal-thinking pg-deal-previewing pg-deal-deal-done pg-deal-game-done')
                    .addClass(newClass);
        },

        _setDealSituation: function(newSituation) {
            var o = this._options;
            o.pgDealUIModel.set('situation', newSituation);
        },

        _switchHandsEx: function(whichHand) {
            var o = this._options,
                hv = o.pgHandViews,
                ti1 = hv[whichHand].tileIndexes(),
                ti2 = hv[whichHand+1].tileIndexes();
            hv[whichHand].setTileIndexes(ti2);
            hv[whichHand+1].setTileIndexes(ti1);
        },

    });

    return PGDealView;
});
