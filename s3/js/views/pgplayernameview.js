/*
*
* @class PGPlayerNameView
*
* The name of the player in the toolbar top
*
*/

define([
    'views/pgbaseview'
], function(
    PGBaseView
) {
    
    var PGPlayerNameView = PGBaseView.extend({

        // Listen for changes
        _addModelListeners: function() {
            this._options.pgPlayerModel.on("change:username", _.bind(function() {
                console.log("PGPlayerView: name changed to " + this._options.pgPlayerModel.get('username'));
                if (this._nameSpan)
                    this._nameSpan.html(this._options.pgPlayerModel.get('username'));
            }, this));

            return this._super();
        },

        // Add a span with the player's name
        _addChildElements: function() {
            this._nameSpan = $('<span></span>');
            this._nameSpan.html(this._options.pgPlayerModel.get('username'));
            this.$el.append(this._nameSpan);

            return this._super();
        },

    });

    return PGPlayerNameView;
});
