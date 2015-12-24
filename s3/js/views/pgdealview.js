/*
*
* @class PGDealView
*
* This file controls what is seen for a single player's 3 hands.
*/

define([
    'utils/pgbrowserutils',
    'utils/pgsessionutils',
    'views/pgbaseview',
    'models/ui/pgdealuimodel',
    'views/pghandview',
    'templates/pggameview'
], function(
    browserUtils,
    sessionUtils,
    PGBaseView,
    PGDealUIModel,
    PGHandView,
    template
) {
    
    var PGDealView = PGBaseView.extend({

        // -------------------------------------------------------
        // Superclass overrides

        initialize: function(options) {
            _.bindAll(this, '_pollForSituation');
            return this._super(options);
        },

        events: {
            'click .pgswitchhands-btn'        : '_switchHands',
            'click .pg-deal-preview-hands'    : '_previewHands',
            'click .pg-deal-un-preview-hands' : '_unPreviewHands',
            'click .pg-deal-tiles-are-set'    : '_tilesAreSet',
            'click .pg-deal-next-deal'        : '_nextDeal',
            'click .pg-deal-another-game'     : '_anotherGame'
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

            // When the deal is gotten we'll set things up correctly.
            if (o.isPlayer) {
                this._setClass('pg-deal-waiting pg-deal-hidden-hands');
            } else {
                this._setClass('pg-deal-opponent pg-deal-hidden-hands');
            }

            return this._super();
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options;

            if (o.isPlayer) {
                // If the situation changes as a result of clicking one of the buttons,
                // update the state of the buttons.
                this.listenTo(o.pgDealUIModel, 'change:situation', this._onDealSituationChange);
                this.listenTo(o.pgDealModel, 'sync', this._onDealSync);
                this.listenTo(o.eventBus, 'deal:tiles_are_set', this._onTilesSet);

                // Start polling for the opponent's state.
                _.delay(this._pollForSituation, 2000);
            } else {
                this.listenTo(o.eventBus, 'deal:opponent_tiles_are_set', this._opponentTilesAreSet);
            }

            this.listenTo(o.eventBus, 'deal:all_tiles_are_set', this._allTilesAreSet);

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
            this._setDealSituation('deal-done');
        },

        _anotherGame: function(e) {
            this._setDealSituation('game-done');
        },

        _onDealSituationChange: function(model, newSituation) {
            var o = this._options;
            switch (newSituation) {
                case 'tiles_are_set':
                    this._setClass('pg-deal-tiles-are-set');
                    this.$el.addClass('pg-no-manipulate')
                            .removeClass('pg-deal-hidden-hands');
                    o.eventBus.trigger('deal:tiles_are_set');
                break;

                case 'thinking':
                    this._setClass('pg-deal-thinking');
                    this.$el.removeClass('pg-no-manipulate pg-deal-hidden-hands');
                    o.eventBus.trigger('deal:thinking');
                break;

                case 'previewing':
                    this._setClass('pg-deal-previewing');
                    this.$el.addClass('pg-no-manipulate')
                            .removeClass('pg-deal-hidden-hands');
                    o.eventBus.trigger('deal:previewing');
                break;

                case 'deal-done':
                    this._setClass('pg-deal-deal-done');
                    this.$el.addClass('pg-no-manipulate')
                            .removeClass('pg-deal-hidden-hands');
                    o.eventBus.trigger('deal:deal-done');
                break;

                case 'game-done':
                    this._setClass('pg-deal-game-done');
                    this.$el.addClass('pg-no-manipulate')
                            .removeClass('pg-deal-hidden-hands');
                    o.eventBus.trigger('deal:game-done');
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
                    // We know the opponent is ready because the deal's
                    // opponent's situation will be 'TILES_ARE_SET'.
                    var oSituation = model.get('situation').opponent;
                    oSituation = 'TILES_NOT_SET';
                    switch (oSituation) {
                        case 'TILES_ARE_SET':
                            o.eventBus.trigger('deal:opponent_tiles_are_set');
                        break;

                        case 'DEAL_NOT_SEEN':
                        case 'TILES_NOT_SET':
                            // The opponent is still thinking.
                        break;
                    }
                }, this),
                error: _.bind(function(model, response, options) {
                    console.log(response);
                }, this),
            });
        },

        // -------------------------------------------------------
        // Convenience methods

        _setClass: function(newClass) {
            this.$el.removeClass('pg-deal-waiting pg-deal-thinking pg-deal-previewing pg-deal-deal-done pg-deal-game-done')
                    .addClass(newClass);
        },

        _setDealSituation: function(newSituation) {
            var o = this._options;
            o.pgDealUIModel.set('situation', newSituation);
        },

        _areAllTilesSet: function(situation) {
            return (situation.opponent === 'TILES_ARE_SET' &&
                    situation.player === 'TILES_ARE_SET');
        },

        _onDealSync: function(model) {
            var o = this._options,
                d = o.pgDealModel,
                s = d.get('situation');

            // Depending on what the situation is, show different states
            // in our hand.
            switch(s.player) {
                case 'TILES_ARE_SET':
                    if (s.opponent === 'TILES_ARE_SET') {
                        this._setDealSituation('deal-done');
                    } else {
                        this._setDealSituation('tiles_are_set');
                    }
                break;

                case 'TILES_NOT_SET':
                    this._setDealSituation('thinking');
                break;

            }
            if (this._areAllTilesSet(s)) {
                o.eventBus.trigger('deal:opponent_tiles_are_set');
            }
        },

        _pollForSituation: function() {
            var o = this._options,
                ajaxOptions = sessionUtils.addSessionHashHeader({
                    url: browserUtils.urlRoot + o.pgDealModel.urlBasePath() + '/situation',
                    success: _.bind(function(pgDealSituation) {
                        if (this._areAllTilesSet(pgDealSituation)) {
                            // We had already set our tiles, and finally the
                            // opponent has set them: fetch the deal again to
                            // get the opponent's tile values.  It will trigger
                            // 'sync' and we'll show and score that that time.
                            o.pgDealModel.fetch();
                        } else if (pgDealSituation.opponent === 'TILES_ARE_SET') {
                            this._opponentTilesAreSet();
                        }
                    }, this),
                    error: _.bind(function(error) {
                        console.log('Cannot get situation... will keep polling!');
                    }, this),
                    complete: _.bind(function() {
                        // Only stop if all tiles are set.
                        if (!this._areAllTilesSet(o.pgDealModel.get('situation'))) {
                            _.delay(this._pollForSituation, 2000);
                        }
                    }, this)
                });
            $.ajax(ajaxOptions);
        },

        _opponentTilesAreSet: function() {
            var o = this._options,
                d = o.pgDealModel,
                tiles;

            // Make sure we know they've set.
            this.$el.addClass('pg-hands-set');

            // If our tiles are set as well, then everything goes.
            if (d.get('situation').player === 'TILES_ARE_SET') {
                o.eventBus.trigger('deal:all_tiles_are_set');
            }
        },

        _allTilesAreSet: function() {
            var o = this._options,
                tiles, ip, points;

            // The opponent's tile now become visible
            if (!o.isPlayer) {
                this.$el.removeClass('pg-deal-hidden-hands');

                // Reset the tile indexes for the hands.
                tiles = o.pgDealModel.get('tiles');
                _.each(o.pgHandViews, function(pgHandView, index) {
                    pgHandView.setTileIndexes(tiles.slice(12+(index*4), 12+((index+1)*4)));
                });
            }

            // Do the scoring.
            points = o.pgDealModel.get('points');
            if (points) {
                for (ip = 0; ip < 3; ip++) {
                    var point = points[ip];
                    if (point) {
                        if (!o.isPlayer) point = -point;
                        handPoint = this.$('.pg-handpoints-' + (3 - ip));
                        handPoint.addClass(point > 0 ? 'pg-winner' : 'pg-loser');
                    }
                }
            }

            this._setDealSituation('deal-done');
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
