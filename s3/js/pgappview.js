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
    'views/pggametableview',
    'views/pggameview'
], function(
    PGPlayerModel,
    PGPlayerNameView,
    PGSigninView,
    PGSessionModel,
    PGDeckModel,
    PGGameModel,
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

        _addModelListeners: function() {
            var eBus = this._options.eventBus;
            this.listenTo(eBus, 'login', this._login);
            this.listenTo(eBus, 'logout', this._logout);
            this.listenTo(eBus, 'click:game', this._resumeGame);

            // Any button on the navbar removes the collapse.
            $(".collapse.navbar-collapse").click(function(e) {
              $(".collapse.navbar-collapse").removeClass("in");
            });
        },

        _login: function() {
            $('body').removeClass('pg-user-signing-in')
                     .addClass('pg-user-signed-in');

            // Create a player model that will communicate with the server about
            // the player specifics.
            var pModel = this._options.pgPlayerModel = new PGPlayerModel({
                eventBus: this._options.eventBus,
            });
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
                            el: $('#pglayer-name-nav'),
                            eventBus: this._options.eventBus,
                            pgPlayerModel: pModel,
                        });
                        o.pgPlayerNameView.render();
                    }

                    // Show the games for this player
                    if (!o.pgGameTableView) {
                        o.pgGameTableView = new PGGameTableView({
                            el: $('#pg-games-table-wrapper'),
                            eventBus: this._options.eventBus,
                            pgSessionModel: this._options.pgSessionModel,
                        });
                        o.pgGameTableView.render();
                    }

                }, this),
                error: _.bind(function() {
                    console.log('error getting player');
                }, this)
            });
        },

        _logout: function() {
            var o = this._options;

            $('body').removeClass('pg-user-signing-in')
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

            // The sign-in view, only if we're not logged in.
            if (!o.pgSigninView) {
                o.pgSigninView = new PGSigninView({
                    el: $(".form-signin"),
                    eventBus: o.eventBus,
                    pgPlayerModel: o.pgPlayerModel,
                    pgSessionModel: o.pgSessionModel,
                });
                o.pgSigninView.render();
            }
        },

        _resumeGame: function(e) {

            // This will make the table disappear.
            $('body').addClass('pg-game-in-progress');

            // // Put the game into view
            // this.gameView = new PGGameView({
            //     el: this.$("#pg-game-view-wrapper"),
            //     eventBus: this._options.eventBus,
            //     pgGameModel: e.gameModel,
            //     pgPlayerModel: this._options.pgPlayerModel
            // });
        }
    });

    return PGAppView;
});
