define([
    'backbone',
    'templates/pggametableview',
    'models/pggamescollection',
    'views/pggametablerowview',
], function(
    Backbone,
    template,
    PGGamesCollection,
    PGGameTableRowView
) {
    
    var PGGameTableView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._options = options;
            this._options.pgGamesCollection = new PGGamesCollection();
            this._options.views = {};
            this._addModelListeners();
        },

        _addModelListeners: function() {
            this.listenTo(this._options.pgGamesCollection, 'add', this._gameAdded)
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

            var rowView = new PGGameTableRowView({
                model: model,
                pgGamesCollection: this._options.pgGamesCollection
            });
            this.$table.append(rowView.render().$el);
            this._options.views[model.classID()] = rowView;
        },

        _gameRemoved: function(model, collection, options) {
            var views = this._options.views,
                rowView = views[model.classID()];
            if (rowView) {
                views.slice(views.indexOf(rowView), 1);
                rowView.remove();
            }
        },

    });

    return PGGameTableView;
});
