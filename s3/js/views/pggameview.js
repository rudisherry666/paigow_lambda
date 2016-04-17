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

            this.listenTo(o.pgDealModel, 'sync', this._show);
            this.listenTo(o.pgGameUIModel, 'change:situation', this._onGameSituationChange);
            this.listenTo(o.pgDealModel, 'change:points', this._onDealPointChange);
            this.listenTo(o.pgGameModel, 'change:score', this._onScoreChange);

            return this._super();
        },

        // Show the game
        _addChildElements: function() {
            var o = this._options,
                $game = this.$el,
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
                    _.pick(o, 'eventBus', 'pgGameModel')));

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

        _show: function(model, deal) {
            this._scoreView.render();
            _.each(this._dealViews, function(dealView) { dealView.render(); });
        },

        _onGameSituationChange: function(model, newSituation) {
            var o = this._options;

            // We're in "no" state now.
            this.$el.removeClass('pg-game-making-room pg-game-ready-for-next-deal pg-game-comparing-hands pg-game-dealing-tiles pg-game-setting-tiles');

            switch (newSituation) {
                case states.READY_FOR_NEXT_DEAL:
                    this.$el.addClass('pg-game-ready-for-next-deal');
                    o.pgDealModel.set('dealID',
                        pgGameModel.get('gameHash') + '#' + (o.pgDealModel.get('dealID') + 1));
                break;

                case states.JUST_DEALT:
                    this.$el.addClass('pg-game-setting-tiles');
                break;

                case states.NEW_DEAL_ASKED_FOR:
                    this.$el.addClass('pg-game-dealing-tiles');
                    this._newDeal();
                break;

                case states.SCORING:
                    this.$el.addClass('pg-game-making-room');
                    _.delay(_.bind(function() {
                        this.$el.addClass('pg-game-comparing-hands');
                        this._addScores();
                    }, this), 2000);
                break;
            }
        },

        _addScores: function() {
            var o = this._options,
                g = o.pgGameModel,
                d = o.pgDealModel,
                score = g.get('score');
            _.each(d.get('points'), function (p) {
                if (p < 0) {
                    score[1] -= p;
                } else if (p > 0) {
                    score[0] += p;
                }
            });
            g.set('score', score);
        },

        _onScoreChange: function(model, newScore) {

        }
    });

    return PGGameView;
});
