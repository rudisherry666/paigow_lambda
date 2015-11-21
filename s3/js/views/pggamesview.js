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
            this._addModelListeners();

            this._options.pgGamesCollection = new PGGamesCollection();
        },

        _addModelListeners: function() {

        },

        // Add a span with the player's name
        render: function() {
            if (this.$el.children().length === 0) {
                var compiled = _.template(template);
                this.$el.append(compiled());
            }
        },

    });

    return PGGamesView;
});
