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
            var row = _.template(template.game);
            this.$table.append(row({
                gameHash: model.get('gameHash'),
                opponent: model.get('players'),
                startTime: this._startTime(model),
                score: this._score(model)
            }));
        },

        _gameRemoved: function(model, collection, options) {
            var $row = this.$('.pg-games-row-hash-' + model.get('gameHash'));
            $row.remove();
        },

        _gameChanged: function(model, options) {
            var $row = this.$('.pg-games-row-hash-' + model.get('gameHash'));
            $row.find('.pg-games-row-opponent').text(model.get('players'));
            $row.find('.pg-games-row-start-time').text(this._startTime(model));
            $row.find('.pg-games-row-score').text(this._score(model));
        },

        _startTime: function(model) {
            var startTime = model.get('startTime');
            return startTime ? (new Date(startTime).toString()) : 'n/a';
        },

        _score: function(model) {
            var score = model.get('score');
            return (score && score.join(' - ')) || "n/a";
        }

    });

    return PGGamesView;
});
