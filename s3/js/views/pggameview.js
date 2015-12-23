/*
*
* @class PGGameView
*
* This file controls the overall page
*/

define([
    'classes/pgtile',
    'models/pgdealmodel',
    'models/ui/pggameuimodel',
    'views/pgbaseview',
    'views/pgdealview',
    'templates/pggameview'
], function(
    PGTile,
    PGDealModel,
    PGGameUIModel,
    PGBaseView,
    PGDealView,
    template
) {

    var PGGameView = PGBaseView.extend({

        _addModels: function() {
            var o = this._options;

            o.pgGameUIModel = new PGGameUIModel({ eventBus: o.eventBus });
            o.pgDealModel = new PGDealModel({
                eventBus: o.eventBus,
                situation: 'thinking'
            });

            return this._super();
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options;

            this.listenTo(o.pgDealModel, 'sync', this._show);

            this.listenTo(o.pgGameModel, 'change:score', this._updateScore);
            this.listenTo(o.pgGameUIModel, 'change:situation', this._onGameSituationChange);

            this.listenTo(o.eventBus, 'deal:tiles_are_set', this._tilesAreSet);

            return this._super();
        },

        // If there is no signin, then show the view.
        _addChildElements: function() {
            var o = this._options,
                $game = this.$el,
                compiled = _.template(template.game),
                oDeal = _.pick(o, 'eventBus', 'pgSessionModel',
                                  'pgGameModel', 'pgDealModel');

            this.$el.append(compiled());

            this._dealViews = [
                new PGDealView(_.extend({
                    el: this.$('.pg-deal-player'),
                    username: o.pgSessionModel.get('username'),
                    isPlayer: true,
                }, oDeal)),
                new PGDealView(_.extend({
                    el: this.$('.pg-deal-opponent'),
                    username: o.pgGameModel.opponent(),
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
            _.each(this._dealViews, function(dealView) { dealView.render(); });
        },

        _onGameSituationChange: function(model, newSituation) {

            // We're in "no" state now.
            this.$el.removeClass('pg-game-making-room pg-game-ready-for-next-deal pg-game-comparing-hands pg-game-dealing-tiles pg-game-setting-tiles');

            switch (newSituation) {
                case states.READY_FOR_NEXT_DEAL:
                    this.$el.addClass('pg-game-ready-for-next-deal');
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
                    }, this), 2000);
                break;
            }
        },

        _handleDealState: function() {
            var o = this._options;

            switch (o.pgDealModel.get('situation')) {

                case 'thinking':
                case 'previewing':
                    // Make sure the computer hand is hidden
                    $(".pg-deal-opponent").addClass("pg-hidden-hands");

                    // All point-nums back to normal.
                    this.$el.find('.pg-handpoints, .pghand').removeClass("pg-winner pg-loser pg-push");
                break;

            }
        },

        // The player has set their tiles
        _tilesAreSet: function() {
            // TBD.
        },

        _updateScore: function() {
            var o = this._options;
        },

    });

    return PGGameView;
});
