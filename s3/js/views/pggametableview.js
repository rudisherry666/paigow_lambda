define([
    'views/pgbaseview',
    'templates/pggametableview',
    'models/pggamescollection',
    'views/pggametablerowview',
], function(
    PGBaseView,
    template,
    PGGamesCollection,
    PGGameTableRowView
) {
    
    var PGGameTableView = PGBaseView.extend({

        _addModelListeners: function() {
            this._options.pgGamesCollection = new PGGamesCollection();
            this.listenTo(this._options.pgGamesCollection, 'add', this._gameAdded)
                .listenTo(this._options.pgGamesCollection, 'remove', this._gameRemoved);

            return this._super();
        },

        // Add a span with the player's name
        _addChildren: function() {
            this._options.views = {};
            var compiled = _.template(template.games);
            this.$el.append(compiled());

            return this._super();
        },

        _addConvenienceProperties: function() {
            this.$table = this.$('.pg-games-table');

            return this._super();
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
