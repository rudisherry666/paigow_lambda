/**
 * @class PGscoreView
 *
 * This file controls the overall game content when playing a game
 */

define([
    'views/pgbaseview',
    'templates/pggameview'
], function(
    PGBaseView,
    template
) {

    var PGScoreView = PGBaseView.extend({

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options;
            this.listenTo(o.pgGameModel, 'change:score', this._onScoreChange);
            return this._super.apply(this, arguments);
        },

        _addChildElements: function() {
            var compiled = _.template(template.score),
                o = this._options,
                score = this._score();
            this.$el.append(compiled({
                playerName: o.amPlayer ? o.playerName : o.opponent,
                opponentName: o.amPlayer ? o.opponent : o.playerName,
                playerScore: score[0],
                opponentScore: score[1],
            }));
            return this._super.apply(this, arguments);
        },

        _onScoreChange: function(model, newScore) {
            var score = this._score();
            this.$('.pg-player-score').text(score[0]);
            this.$('.pg-opponent-score').text(score[1]);
        },

        _score: function() {
            var o = this._options,
                score = o.pgGameModel.get('score');
            if (o.amPlayer) {
                return score;
            } else {
                return [ score[1], score[0] ];
            }
        }
    });

    return PGScoreView;
});
