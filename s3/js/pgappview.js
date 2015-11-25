/*
* @class pgapp
*
* Main class for the paigow app.
*
*/

define([
    'backbone',
    'backbone-super',
    'underscore',
    'models/pgplayermodel',
    'views/pgplayernameview',
    'views/pgsigninview',
    'models/pgsessionmodel',
    'models/pgdeckmodel',
    'models/pggamemodel',
    'views/pggametableview'
], function(
    Backbone,
    BackboneSuper,
    _,
    PGPlayerModel,
    PGPlayerNameView,
    PGSigninView,
    PGSessionModel,
    PGDeckModel,
    PGGameModel,
    PGGameTableView) {

    var PGAppView = Backbone.View.extend({

        initialize: function() {
            // Create/remember the event bus and session model.
            var eventBus = _.extend({}, Backbone.Events);
            this._options = {
                eventBus: eventBus,
                pgSessionModel: new PGSessionModel({ eventBus: eventBus })
            };

            this._addModelListeners();

            this._options.pgSessionModel.startSession();

        },

        _addModelListeners: function() {
            this.listenTo(this._options.eventBus, 'login', this._login);
            this.listenTo(this._options.eventBus, 'logout', this._logout);

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
            $('body').removeClass('pg-user-signing-in')
                     .addClass('pg-user-not-signed-in');

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
                    eventBus: this._options.eventBus,
                    pgPlayerModel: this._options.pgPlayerModel,
                    pgSessionModel: this._options.pgSessionModel,
                });
                this._options.pgSigninView.render();
            }
        },


    });

    return PGAppView;
});
