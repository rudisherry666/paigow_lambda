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
            this._addModels();
            this._addModelListeners();
            return this;
        },

        _addModels: function() {

        },

        _addModelListeners: function() {
            return this;
        },

        // Fill in the row
        render: function() {
            if (this.$el.children().length === 0) {
                this._addChildElements()
                    ._addConvenienceProperties()
                    ._renderChildren();
            }
            return this;
        },

        _addChildElements: function() {
            return this;
        },

        _addConvenienceProperties: function() {
            return this;
        },

        _renderChildren: function() {
            return this;
        }

    });

    return PGBaseView;
});
