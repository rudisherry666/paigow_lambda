/*
* @class pgapp
*
* Main class for the paigow app.
*
*/

define([
    'models/pgplayermodel',
    'views/pgplayernameview',
    'views/pgsigninview',
    'models/pgsessionmodel',
    'models/pgdeckmodel',
    'models/pggamemodel',
    'views/pggamesview'
], function(
    PGPlayerModel,
    PGPlayerNameView,
    PGSigninView,
    PGSessionModel,
    PGDeckModel,
    PGGameModel,
    PGGamesView) {

    var PGApp = Backbone.View.extend({

        initialize: function() {
            this._options = {};

            // Create a session model.
            this._options.pgSessionModel = new PGSessionModel();

            this.listenTo(this._options.pgSessionModel, 'login', _.bind(function() {

                $('body').removeClass('pg-user-signing-in').addClass('pg-user-signed-in');

                // Create a player model that will communicate with the server about
                // the player specifics.
                var pModel = this._options.pgPlayerModel = new PGPlayerModel();
                this.listenTo(pModel, 'change:state', this._onSignin);
                pModel.fetch({
                    success: _.bind(function() {
                        var o = this._options;

                        console.log('success getting player');

                        if (o.pgSigninView) {
                            o.pgSigninView.remove();
                            delete o.pgSigninView;
                        }

                        // The part of the nav bar where the name is shown
                        if (!o.pgPlayerNameView) {
                            o.pgPlayerNameView = new PGPlayerNameView({
                                pgPlayerModel: pModel,
                                el: $('#pglayer-name-nav')
                            });
                            o.pgPlayerNameView.render();
                        }

                        // Show the games for this player
                        if (!o.pgGamesView) {
                            o.pgGamesView = new PGGamesView({
                                el: $('#pg-games-view-wrapper'),
                                pgSessionModel: this._options.pgSessionModel
                            });
                            o.pgGamesView.render();
                        }

                    }, this),
                    error: _.bind(function() {
                        console.log('error getting player');
                    }, this)
                });
            }, this));

            this.listenTo(this._options.pgSessionModel, 'logout', _.bind(function() {

                $('body').removeClass('pg-user-signing-in').addClass('pg-user-not-signed-in');

                var pModel = this._options.pgPlayerModel;
                if (pModel) {
                    this.stopListening(pModel);
                    delete this._options.pgPlayerModel;
                }

                if (this._options.pgPlayerNameView) {
                    this._options.pgPlayerNameView.remove();
                    delete this._options.pgPlayerNameView;
                }

                // The sign-in view, only if we're not logged in.
                if (!this._options.pgSigninView) {
                    this._options.pgSigninView = new PGSigninView({
                        el: $(".form-signin"),
                        pgPlayerModel: this._options.pgPlayerModel,
                        pgSessionModel: this._options.pgSessionModel
                    });
                    this._options.pgSigninView.render();
                }
            }, this));

            this._options.pgSessionModel.startSession();

            // Any button on the navbar removes the collapse.
            $(".collapse.navbar-collapse").click(function(e) {
              $(".collapse.navbar-collapse").removeClass("in");
            });

            _.bindAll(this, '_newGame');
        },

        _newGame: function(e) {
            pgGameView.newGame(e);
        },

        _onSignin: function(model, state) {
            var $gameView, $newGame;
            switch(state) {
                case 'signed-in':
                    // if (!pgGameView) {
                    //     // The container where the game is played
                    //     $gameView = $('<div class="pggame"></div>');
                    //     $('.pg-game').append($gameView);
                    //     pgGameView = new PGGameView({
                    //         el: $gameView[0],
                    //         pgPlayerModel: this._options.pgPlayerModel,
                    //         pgDeckModel: this._options.pgDeckModel,
                    //         pgGameModel: this._options.pgGameModel
                    //     });
                    //     $newGame = $('#pg-new-game');
                    // }

                    // // Don't double-bind
                    // if ($newGame) {
                    //     $newGame.unbind('click', this._newGame);
                    //     $newGame.bind('click', this._newGame);
                    // }
                break;

                case 'not-signed-in':
                    if ($newGame) {
                        $newGame.unbind('click', this._newGame);
                    }
                break;
            }
        },

    });

    return PGApp;
});
