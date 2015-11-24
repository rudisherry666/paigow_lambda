define([
    'backbone',
    'backbone-super'
], function(
    Backbone
) {
    
    var PGBaseView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._options = options;
            this._addModelListeners();
            return this;
        },

        _addModelListeners: function() {
            return this;
        },

        // Fill in the row
        render: function() {
            if (this.$el.children().length === 0) {
                this._addChildren()._addConvenienceProperties();
            }
            return this;
        },

        _addChildren: function() {
            return this;
        },

        _addConvenienceProperties: function() {
            return this;
        },

    });

    return PGBaseView;
});
