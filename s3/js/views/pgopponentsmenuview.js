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
            _.bindAll(this, '_newGameAgainst');
            return this._super.apply(this, arguments);
        },

        // Listen for changes
        _addModelListeners: function() {
            this.listenTo(this._options.pgPlayersCollection, 'add', this._playerAdded)
                .listenTo(this._options.pgPlayersCollection, 'remove', this._playerRemoved);

            this.$el.on('click .pg-opponent-name-ref', this._newGameAgainst);

            return this._super.apply(this, arguments);
        },

        _addChildElements: function() {
            return this._super.apply(this, arguments);
        },

        _addPlayer: function(player) {
            var tmpl = _.template('<li class="pg-menu-item pg-opponent-name <%- situation %>"><a class="pg-opponent-name-ref" href="#"><%= playerName %></a></li>'),
                html = tmpl({
                    playerName: player.get('username'),
                    situation: player.get('situation') === 'LOGGED_IN' ? 'pg-logged-in' : 'pg-logged-out'
                }),
                curPlayerRefs = this.$el.find('.pg-opponent-name-ref'),
                cpi, inserted;
            for (cpi = 0; cpi < curPlayerRefs.length; cpi++) {
                var $menuPlayer = $(curPlayerRefs[cpi]);
                if (player.get('username') < $menuPlayer.text()) {
                    $menuPlayer.parent().before(html);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                this.$el.append(html);
            }
        },

        _playerAdded: function(player) {
            var newPlayerName = player.get('username');
            if (newPlayerName !== this._options.pgPlayerModel.get('username')) {
                this._addPlayer(player);
            }
        },

        _playerRemoved: function(player) {
            console.log('player removed: ' + player.get('username'));
        },

        _newGameAgainst: function(e) {
            var opponentName = $(e.target).html();
            console.log('New game against ' + opponentName);
            this._options.eventBus.trigger('game:new', { opponent: opponentName.trim() });
        }

    });

    return PGOpponentsMenuView;
});
