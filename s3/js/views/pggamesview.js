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
            this.listenTo(this._options.pgGamesCollection, 'add', this._gameAdded);
            this.listenTo(this._options.pgGamesCollection, 'change', this._gameChanged);
            this.listenTo(this._options.pgGamesCollection, 'remove', this._gameRemoved);
        },

        // Add a span with the player's name
        render: function() {
            if (this.$el.children().length === 0) {
                var compiled = _.template(template);
                this.$el.append(compiled());
            }
        },

        _gameAdded: function(model, collection, options) {
            console.log('gameAdded!');
            console.log(model);
            console.log(collection);
            console.log(options);
        },

        _gameRemoved: function(model, collection, options) {
            console.log('gameRemoved!');
            console.log(model);
            console.log(collection);
            console.log(options);
        },

        _gameChanged: function(model, options) {
            console.log('gameChanged!');
            console.log(model);
            console.log(options);
        },

    });

    return PGGamesView;
});
