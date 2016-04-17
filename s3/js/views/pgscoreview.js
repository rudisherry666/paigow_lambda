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
                score = o.pgGameModel.get('score');
            this.$el.append(compiled({
                playerName: o.amPlayer ? o.playerName : o.opponent,
                opponentName: o.amPlayer ? o.opponent : o.playerName,
                playerScore: score[o.amPlayer ? 0 : 1],
                opponentScore: score[o.amPlayer ? 1 : 0],
            }));
            return this._super.apply(this, arguments);
        },

    });

    return PGScoreView;
});
