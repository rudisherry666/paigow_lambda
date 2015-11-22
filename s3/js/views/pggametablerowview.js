define([
    'backbone',
    'templates/pggametableview',
    'models/pggamescollection'
], function(
    Backbone,
    template,
    PGGamesCollection
) {
    
    var PGGameTableRowView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._options = options;
            this._addModelListeners();
        },

        _addModelListeners: function() {
            this.listenTo(this._options.model, 'change', this._gameChanged);
        },

        tagName: 'tr',

        // Add this game to the table (our $el's parent)
        render: function() {
            if (this.$el.children().length === 0) {
                var model = this._options.model,
                    row = _.template(template.game);
                this.$el.append(row({
                    opponent: model.opponent(),
                    startTime: model.startTime(),
                    score: model.score()
                }));
                this.$el.addClass(model.classID());

            }
            return this;
        },

        _gameChanged: function(model, options) {
            this.$('.pg-games-row-opponent').text(model.opponent());
            this.$('.pg-games-row-start-time').text(model.startTime());
            this.$('.pg-games-row-score').text(model.score());
        },

    });

    return PGGameTableRowView;
});
