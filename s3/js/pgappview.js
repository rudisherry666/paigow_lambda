/*
* @class pgapp
*
* Main class for the paigow app.
*
*/

define([
    'utils/pgsessionutils',
    'models/pgplayermodel',
    'views/pgplayernameview',
    'views/pgsigninview',
    'views/pgopponentsmenuview',
    'models/pgsessionmodel',
    'models/pgdeckmodel',
    'models/pggamemodel',
    'models/pggamescollection',
    'models/pgplayerscollection',
    'views/pggametableview',
    'views/pggameview'
], function(
    sessionUtils,
    PGPlayerModel,
    PGPlayerNameView,
    PGSigninView,
    PGOpponentsMenuView,
    PGSessionModel,
    PGDeckModel,
    PGGameModel,
    PGGamesCollection,
    PGPlayersCollection,
    PGGameTableView,
    PGGameView
) {

    var PGAppView = Backbone.View.extend({

        initialize: function() {
            // Create/remember the event bus and session model.
            var eBus = _.extend({}, Backbone.Events);
            this._options = {
                eventBus: eBus,
                pgSessionModel: new PGSessionModel({ eventBus: eBus })
            };

            this._addModelListeners();

            this._options.pgSessionModel.startSession();

        },

        events: function() {
            return {
                'click #pg-new-game'   :   '_newGame'
            };
        },

        _addModelListeners: function() {
            var eBus = this._options.eventBus;
            this.listenTo(eBus, 'login', this._login);
            this.listenTo(eBus, 'logout', this._logout);
            this.listenTo(eBus, 'click:game', this._resumeGame);
            this.listenTo(eBus, 'click:opponent', this._clickOpponent);

            // Any button on the navbar removes the collapse.
            $(".collapse.navbar-collapse").click(function(e) {
              $(".collapse.navbar-collapse").removeClass("in");
            });
        },

        _login: function() {
            $('body').removeClass('pg-user-signing-in pg-user-not-signed-in')
                     .addClass('pg-user-signed-in');

            // Create a player model that will communicate with the server about
            // the player specifics.
            var pModel = this._options.pgPlayerModel = new PGPlayerModel({
                eventBus: this._options.eventBus,
            });
            pModel.fetch({
                success: _.bind(function() {
                    var o = this._options;

                    o.pgGamesCollection = new PGGamesCollection();
                    o.pgPlayersCollection = new PGPlayersCollection();

                    console.log('success getting player');

                    if (o.pgSigninView) {
                        o.pgSigninView.remove();
                        delete o.pgSigninView;
                    }

                    // The part of the nav bar where the name is shown
                    if (!o.pgPlayerNameView) {
                        o.pgPlayerNameView = new PGPlayerNameView({
                            el: $('#pglayer-name-nav'),
                            eventBus: o.eventBus,
                            pgPlayerModel: pModel,
                        });
                        o.pgPlayerNameView.render();
                    }

                    // Show the games for this player
                    if (!o.pgGameTableView) {
                        o.pgGameTableView = new PGGameTableView({
                            el: $('#pg-games-table-wrapper'),
                            eventBus: o.eventBus,
                            pgSessionModel: o.pgSessionModel,
                            pgGamesCollection: o.pgGamesCollection
                        });
                        o.pgGameTableView.render();
                    }

                    // Populate the new-game menu with opponents
                    if (!o.pgOpponentsMenuView) {
                        o.pgOpponentsMenuView = new PGOpponentsMenuView({
                            el: $('.pg-opponents-dropdown-ul'),
                            eventBus: o.eventBus,
                            pgSessionModel: o.pgSessionModel,
                            pgPlayersCollection: o.pgPlayersCollection,
                            pgPlayerModel: pModel,
                        });
                        o.pgOpponentsMenuView.render();
                    }

                    // Now that we have a table, get the games.
                    o.pgGamesCollection.fetch();
                    o.pgPlayersCollection.fetch();

                }, this),
                error: _.bind(function() {
                    console.log('error getting player');
                }, this)
            });
        },

        _logout: function() {
            var o = this._options;

            $('body').removeClass('pg-user-signing-in pg-user-signed-in')
                     .addClass('pg-user-not-signed-in');

            var pModel = o.pgPlayerModel;
            if (pModel) {
                this.stopListening(pModel);
                delete o.pgPlayerModel;
            }

            if (o.pgPlayerNameView) {
                o.pgPlayerNameView.remove();
                delete o.pgPlayerNameView;
            }

            if (o.pgGameTableView) {
                o.pgGameTableView.remove();
                delete o.pgGameTableView;
            }

            if (o.pgOpponentsMenuView) {
                o.pgOpponentsMenuView.remove();
                delete o.pgOpponentsmenuview;
            }

            // The sign-in view, only if we're not logged in.
            if (!o.pgSigninView) {
                o.pgSigninView = new PGSigninView({
                    el: $(".form-signin"),
                    eventBus: o.eventBus,
                    pgSessionModel: o.pgSessionModel,
                    pgPlayerModel: o.pgPlayerModel,
                });
                o.pgSigninView.render();
            }
        },

        _resumeGame: function(e) {
            var o = this._options;

            // This will make the table disappear.
            $('body').addClass('pg-game-in-progress');

            // Put the game into view
            o.pgGameView = new PGGameView({
                el: $("#pg-game-view-wrapper"),
                eventBus: o.eventBus,
                pgSessionModel: o.pgSessionModel,
                pgPlayerModel: o.pgPlayerModel,
                pgGameModel: e.pgGameModel,
                // dealIndex: e.pgGameModel.get('lastDealIndex'),
            });

            o.pgGameView.render();
        },

        _clickOpponent: function(e) {
            if (e.pgGameModel.isNewGame()) {
                this._newGame();
            }
        },

        _newGame: function(e) {
            var ajaxOptions = {
                method: 'POST',
                contentType: 'application/json',
                url: this._options.pgSessionModel.urlRoot + '/game',
                data: JSON.stringify({
                    opponent: 'computer'
                }),
                success: _.bind(function(data) {
                    var o = this._options;

                    // Start the game once the add has finished.
                    this._options.pgGamesCollection.once('add', _.bind(function(pgGameModel) {
                        if (pgGameModel.players) {
                            this._resumeGame({
                                pgGameModel: pgGameModel,
                                pgSessionModel: o.pgSessionModel,
                                pgPlayerModel: o.pgPlayerModel
                            });
                        } else {
                            pgGameModel.once('sync', _.bind(function(pgGameModel) {
                                this._resumeGame({
                                    pgGameModel: pgGameModel,
                                    pgSessionModel: o.pgSessionModel,
                                    pgPlayerModel: o.pgPlayerModel
                                });
                            }, this));
                        }
                    }, this));
                    // We created a new game; the response is the same
                    // as getting all the games, so just add it as is
                    // and the new game will be vivified.
                    this._options.pgGamesCollection.add(data);

                }, this),
                error: function(err) {
                    console.log(err);
                }
            };
            sessionUtils.addSessionHashHeader(ajaxOptions);
            $.ajax(ajaxOptions);
        }
    });

    return PGAppView;
});
