/*
*
* @class PGGameView
*
* This file controls the overall game content when playing a game
*/

define([
    'classes/pgtile',
    'models/pgdealmodel',
    'models/ui/pggameuimodel',
    'views/pgbaseview',
    'views/pgdealview',
    'views/pgscoreview',
    'templates/pggameview'
], function(
    PGTile,
    PGDealModel,
    PGGameUIModel,
    PGBaseView,
    PGDealView,
    PGScoreView,
    template
) {

    var PGGameView = PGBaseView.extend({

        _addModels: function() {
            var o = this._options;

            o.pgGameUIModel = new PGGameUIModel({ eventBus: o.eventBus });
            o.pgDealModel = new PGDealModel({
                eventBus: o.eventBus,
                situation: 'thinking',
            });

            return this._super();
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options;

            this.listenTo(o.pgDealModel, 'sync', this._showDeal);
            this.listenTo(o.pgGameUIModel, 'change:situation', this._onGameSituationChange);
            this.listenTo(o.eventBus, 'game:next-deal', this._onNextDeal);
            this.listenTo(o.eventBus, 'deal:all_tiles_are_set', this._onTilesAreSet);

            return this._super();
        },

        // Show the game
        _addChildElements: function() {
            var o = this._options,
                compiled = _.template(template.game),
                oDeal = _.pick(o, 'eventBus', 'pgSessionModel',
                                  'pgGameModel', 'pgDealModel'),
                playerName = o.pgSessionModel.get('username'),
                g = o.pgGameModel,
                opponent = g.opponent(),
                amPlayer = g.get('players').indexOf(playerName) === 0,
                score = g.get('score');

            this.$el.append(compiled());

            this._scoreView = new PGScoreView(
                _.extend({
                        el: this.$('.pg-score'),
                        amPlayer: amPlayer,
                        playerName: playerName,
                        opponent: opponent
                    },
                    _.pick(o, 'eventBus', 'pgGameModel', 'pgDealModel')));

            this._dealViews = [
                new PGDealView(_.extend({
                    el: this.$('.pg-deal-player'),
                    username: playerName,
                    isPlayer: true,
                }, oDeal)),
                new PGDealView(_.extend({
                    el: this.$('.pg-deal-opponent'),
                    username: opponent,
                    isPlayer: false,
                }, oDeal)),
            ];

            return this._super();
        },

        _renderChildren: function() {
            var o = this._options,
                pgGameModel = o.pgGameModel,
                lastDealIndex = pgGameModel.get('lastDealIndex');

            // We might be called before the game has completed fetching: if
            // the lastDealIndex is -1, wait until it's set.
            if (lastDealIndex < 0) {
                pgGameModel.once('change:lastDealIndex', _.bind(function(model, dealIndex) {
                    o.pgDealModel.set('dealID',
                        pgGameModel.get('gameHash') + '#' + dealIndex);
                }, this));

            } else {
                // This will cause the deal to fetch, and then trigger 'sync'
                // will cause <huh? unfinished comment>
                o.pgDealModel.set('dealID',
                    pgGameModel.get('gameHash') + '#' + lastDealIndex);
            }

            return this._super();
        },

        // The new deal is just sync'ed, now we have tiles and can show.
        _showDeal: function(model, deal) {
            var o = this._options,
                gui = o.pgGameUIModel,
                situations = gui.situations;

            console.log('deal sync triggered');

            this._scoreView.render();
            _.each(this._dealViews, function(dealView) { dealView.render(); });

            // TODO: better mechanism for figuring out that we just dealt;
            // deal triggers 'sync' too often.
            if (gui.get('situation') === situations.NEW_DEAL_ASKED_FOR) {
                this._options.pgGameUIModel.set('situation', situations.JUST_DEALT);
            }
        },

        _onGameSituationChange: function(model, newSituation) {
            var o = this._options,
                situations = o.pgGameUIModel.situations;

            // We're in "no" state now.
            this.$el.removeClass('pg-game-making-room pg-game-ready-for-next-deal pg-game-comparing-hands pg-game-dealing-tiles pg-game-setting-tiles');

            switch (newSituation) {
                case situations.JUST_DEALT:
                    this.$el.addClass('pg-game-setting-tiles');
                break;

                case situations.NEW_DEAL_ASKED_FOR:
                    this.$el.addClass('pg-game-dealing-tiles');
                break;

                case situations.SCORING:
                    this.$el.addClass('pg-game-making-room');
                    _.delay(_.bind(function() {
                        this.$el.addClass('pg-game-comparing-hands');
                        this._addScores();
                    }, this), 2000);
                break;
            }
        },

        _onTilesAreSet: function() {
            var o = this._options,
                gui = o.pgGameUIModel,
                situations = gui.situations;
            gui.set('situation', situations.SCORING);
        },

        _onNextDeal: function() {
            var o = this._options,
                gui = o.pgGameUIModel,
                situations = gui.situations,
                d = o.pgDealModel;
            gui.set('situation', situations.NEW_DEAL_ASKED_FOR);
            o.pgDealModel.set('dealID',
                pgGameModel.get('gameHash') + '#' + (o.pgDealModel.get('dealID') + 1));
        },

        _addScores: function() {
            var o = this._options,
                g = o.pgGameModel,
                d = o.pgDealModel,
                score = g.get('score').slice();
            _.each(d.get('points'), function (p) {
                if (p < 0) {
                    score[1] -= p;
                } else if (p > 0) {
                    score[0] += p;
                }
            });
            g.set('score', score);
        },
    });

    return PGGameView;
});
