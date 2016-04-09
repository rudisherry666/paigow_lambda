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
    
    var PGOpponentsMenuView = PGBaseView.extend({

        initialize: function() {
            return this._super.apply(this, arguments);
        },

        // Listen for changes
        _addModelListeners: function() {
            this.listenTo(this._options.pgPlayersCollection, 'add', this._playerAdded)
                .listenTo(this._options.pgPlayersCollection, 'remove', this._playerRemoved);

            return this._super.apply(this, arguments);
        },

        _addChildElements: function() {
            return this._super.apply(this, arguments);
        },

        _playerAdded: function(player) {
            if (player.get('username') !== this._options.pgPlayerModel.get('username')) {
                var tmpl = _.template('<li class="pg-menu-item pg-opponent-name"><a href="#"><%= playerName %></a></li>'),
                    html = tmpl({ playerName: player.get('username') });
                this.$el.append(html);
            }
        },

        _playerRemoved: function(player) {
            console.log('player removed: ' + player.get('username'));
        }

    });

    return PGOpponentsMenuView;
});
