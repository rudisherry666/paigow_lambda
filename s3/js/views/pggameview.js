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
            o.pgDealModel = new PGDealModel({ eventBus: o.eventBus });

            return this._super();
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options;

            this.listenTo(o.pgDealModel, 'sync', this._show);

            // this.listenTo(o.playerDealModel, 'change:state', this._handleDealState);
            this.listenTo(o.pgGameModel, 'change:score', this._updateScore);
            this.listenTo(o.pgGameUIModel, 'change:state', this._onGameStateChange);
            this.listenTo(p.pgDealModel, 'change:state', this._handleDealState);

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
            var o = this._options;

            // This will cause the deal to fetch, and then trigger 'sync'
            // will cause 
            o.pgDealModel.set('dealID',
                o.pgGameModel.get('gameHash') + '#' + o.dealIndex);

            return this._super();
        },

        _show: function() {
            _.each(this._dealViews, function(dealView) { dealView.render(); });

            // if ((this._playerModel.get('state') === 'static') && (this._playerModel.get('username') !== "unknown")) {
            // } else {
            //     this.$el.finish().fadeOut(500);
            // }
        },

        newGame: function() {
            this.$el.finish().fadeOut(500);
            this.render();

            var $game = $(".pggame");

            // Set the score.  Manually trigger a score change just in case the score
            // was already 0-0.  Unfortunately is no backbone option to force a trigger
            // even if the new value is the same as the last value.
            this._gameModel.set('player_score', 0);
            this._gameModel.set('opponent_score', 0);
            this._gameModel.trigger("change:score");

            this.$el.finish().fadeIn(500);
            this._newDeal();
        },

        _onGameStateChange: function(model, newState) {
            var o = this._options,
                states = o.pgGameUIModel.state;

            // We're in "no" state now.
            this.$el.removeClass('pg-game-making-room pg-game-ready-for-next-deal pg-game-comparing-hands pg-game-dealing-tiles pg-game-setting-tiles');

            switch (newState) {
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

        _newDeal: function() {
            this._deckModel.washTiles();

            // We deal the tiles, start over.
            this._gameModel.set('state', "just_dealt");

            // Order the three hands (sets)
            this._dealViews[1].orderSets();
            this._opponentDealModel.set('state', 'previewing');
        },

        _handleDealState: function() {
            switch (this._playerDealModel.get('state')) {

                case 'thinking':
                case 'previewing':
                    // Make sure the computer hand is hidden
                    $(".pg-opponent-deal").addClass("pg-hidden-hand");

                    // All point-nums back to normal.
                    this.$el.find('.pg-handpoints, .pghand').removeClass("pg-winner pg-loser pg-push");
                break;

                // The player has set their tiles
                case 'tiles_are_set':
                    this._gameModel.set('state', "scoring");

                    // Show the computer hands
                    $(".pg-opponent-deal").removeClass("pg-hidden-hand");

                    // Set the score.

                    // All the handpoints: they go from player 321 to computer 321.
                    var $scoreNums = this.$el.find('.pg-handpoints');
                    var $hands = this.$el.find('.pghand');
                    var playerHands = this._playerDealModel.get('handmodels');
                    var computerHands = this._opponentDealModel.get('handmodels');
                    for (var hi = 0; hi < 3; hi++) {
                        var points = 3 - hi;
                        var playerIndex = hi;
                        var computerIndex = hi + 3;
                        var playerSet = playerHands[hi].pgSet();
                        var computerSet = computerHands[hi].pgSet();
                        switch (playerSet.compare(computerSet)) {
                            case 1:   // player wins
                                $($hands[playerIndex]).addClass('pg-winner');
                                $($hands[computerIndex]).addClass('pg-loser');
                                $($scoreNums[playerIndex]).addClass('pg-winner');
                                $($scoreNums[computerIndex]).addClass('pg-loser');
                                this._gameModel.set('player_score', this._gameModel.get('player_score') + points);
                            break;

                            case 0:   // push
                                $($hands[playerIndex]).addClass('pg-push');
                                $($hands[computerIndex]).addClass('pg-push');
                                $($scoreNums[playerIndex]).addClass('pg-push');
                                $($scoreNums[computerIndex]).addClass('pg-push');
                            break;

                            case -1:  // computer wins
                                $($hands[computerIndex]).addClass('pg-winner');
                                $($hands[playerIndex]).addClass('pg-loser');
                                $($scoreNums[computerIndex]).addClass('pg-winner');
                                $($scoreNums[playerIndex]).addClass('pg-loser');
                                this._gameModel.set('opponent_score', this._gameModel.get('opponent_score') + points);
                            break;
                        }
                    }

                    // Test for finished game.
                    if (this._gameModel.get('player_score') >= 21 || this._gameModel.get('opponent_score') >= 21) {
                        // Game is finished.  User will have to pick new game.
                        this._gameModel.set('state', 'game_over');
                    } else {
                        // Still more to play.
                        this._gameModel.set('state', "ready_for_next_deal");
                    }
                break;
            }
        },

        _updateScore: function() {
            this.$el.find('.pg-player-name').text(this._playerModel.get('username'));
            this.$el.find('.pg-player-score').text(this._gameModel.get('player_score'));
            this.$el.find('.pg-opponent-name').text(this._gameModel.get('opponent_name'));
            this.$el.find('.pg-opponent-score').text(this._gameModel.get('opponent_score'));
        },

        _gameTemplate:
                '<div>' +
                    '<p class="pgscore"><span class="pg-player-name"></span>: <span class="pg-player-score"></span> <span class="pg-opponent-name"></span>: <span class="pg-opponent-score"></span></p>' +
                    '<div class="pgdeal pg-player-deal"></div>' +
                    '<div class="pgdeal pg-opponent-deal pg-hidden-hand"></div>' +
                '</div>'

    });

    return PGGameView;
});
