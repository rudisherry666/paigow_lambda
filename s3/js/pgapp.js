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
    'views/pggameview'
], function(
    PGPlayerModel,
    PGPlayerNameView,
    PGSigninView,
    PGSessionModel,
    PGDeckModel,
    PGGameModel,
    PGGameView) {

    var PGApp = Backbone.View.extend({

        initialize: function() {
            this._options = {};

            // Create a session model.
            this._options.pgSessionModel = new PGSessionModel();

            this.listenTo(this._options.pgSessionModel, 'login', _.bind(function() {

                // Create a player model that will communicate with the server about
                // the player specifics.
                var pModel = this._options.pgPlayerModel = new PGPlayerModel();
                this.listenTo(pModel, 'change:state', this._onSignin);
                pModel.fetch({
                    success: _.bind(function() {
                        console.log('success getting player');

                        if (this._options.pgSigninView) {
                            this._options.pgSigninView.remove();
                            delete this._options.pgSigninView;
                        }

                        // The part of the nav bar where the name is shown
                        this._options.pgPlayerNameView = new PGPlayerNameView({
                            pgPlayerModel: pModel,
                            $el: $("#pglayer-name-nav")
                        });
                        this._options.pgPlayerNameView.render();
                    }, this),
                    error: _.bind(function() {
                        console.log('error getting player');
                    }, this)
                });
            }, this));

            this.listenTo(this._options.pgSessionModel, 'logout', _.bind(function() {
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
                this._options.pgSigninView = new PGSigninView({
                    el: $(".form-signin")[0],
                    pgPlayerModel: this._options.pgPlayerModel,
                    pgSessionModel: this._options.pgSessionModel
                });
                this._options.pgSigninView.render();
            }, this));

            // Create a deck model that everyone will use.
            var pgDeckModel = new PGDeckModel();

            // Create a game model.  For now we don't fetch it.
            var pgGameModel = new PGGameModel({ pgDeckModel: pgDeckModel });

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
                    if (!pgGameView) {
                        // The container where the game is played
                        $gameView = $('<div class="pggame"></div>');
                        $('.pg-game').append($gameView);
                        pgGameView = new PGGameView({
                            el: $gameView[0],
                            pgPlayerModel: this._options.pgPlayerModel,
                            pgDeckModel: this._options.pgDeckModel,
                            pgGameModel: this._options.pgGameModel
                        });
                        $newGame = $('#pg-new-game');
                    }

                    // Don't double-bind
                    if ($newGame) {
                        $newGame.unbind('click', this._newGame);
                        $newGame.bind('click', this._newGame);
                    }
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
