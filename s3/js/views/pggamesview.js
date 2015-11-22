define([
    'backbone',
    'templates/pggamesview',
    'models/pggamescollection'
], function(
    Backbone,
    template,
    PGGamesCollection
) {
    
    var PGGamesView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._options = options;
            this._options.pgGamesCollection = new PGGamesCollection();
            this._addModelListeners();
        },

        _addModelListeners: function() {
            this.listenTo(this._options.pgGamesCollection, 'add', this._gameAdded)
                .listenTo(this._options.pgGamesCollection, 'change', this._gameChanged)
                .listenTo(this._options.pgGamesCollection, 'remove', this._gameRemoved);
        },

        // Add a span with the player's name
        render: function() {
            if (this.$el.children().length === 0) {
                var compiled = _.template(template.games);
                this.$el.append(compiled());

                this.$table = this.$('.pg-games-table');
            }
        },

        _gameAdded: function(model, collection, options) {

            // The model needs to know our session to know which
            // player in the game is the opponent.
            model.set('sessionModel', this._options.pgSessionModel);

            // Add the row for this game.
            row = _.template(template.game);
            this.$table.append(row({
                gameHash: model.get('gameHash'),
                opponent: model.opponent(),
                startTime: model.startTime(),
                score: model.score()
            }));
        },

        _gameRemoved: function(model, collection, options) {
            var $row = this.$('.pg-games-row-hash-' + model.get('gameHash'));
            $row.remove();
        },

        _gameChanged: function(model, options) {
            var $row = this.$('.pg-games-row-hash-' + model.get('gameHash'));
            $row.find('.pg-games-row-opponent').text(model.opponent());
            $row.find('.pg-games-row-start-time').text(model.startTime());
            $row.find('.pg-games-row-score').text(model.score());
        },

    });

    return PGGamesView;
});
