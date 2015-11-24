define([
    'views/pgbaseview',
    'templates/pggametableview',
    'models/pggamescollection'
], function(
    PGBaseView,
    template,
    PGGamesCollection
) {
    
    var PGGameTableRowView = PGBaseView.extend({

        // This causes Backbone to create a <tr></tr>; our
        // parent view will add us to its table.
        tagName: 'tr',

        _addModelListeners: function() {
            this.listenTo(this._options.model, 'change', this._gameChanged);
            return this._super();
        },

        _addChildren: function() {
           var model = this._options.model,
                row = _.template(template.game);
            this.$el.append(row({
                opponent: model.opponent(),
                startTime: model.startTime(),
                score: model.score()
            }));
            this.$el.addClass(model.classID());
            return this._super();
        },

        _addConvenienceProperties: function() {
            this.$opponent = this.$('.pg-games-row-opponent');
            this.$startTime = this.$('.pg-games-row-start-time');
            this.$score = this.$('.pg-games-row-score');
            return this._super();
        },

        _addGetureHandlers: function() {
            return this._super();
        },

        _gameChanged: function(model, options) {
            this.$opponent.text(model.opponent());
            this.$startTime.text(model.startTime());
            this.$score.text(model.score());
        },

    });

    return PGGameTableRowView;
});
