/*
*
* @class PGSigninView
*
* This file controls the signing or register view on the main page.
*/

define([
    'bootstrap',
    'backbone',
    'models/pgsessionmodel',
    'jquery-ui'
], function(
    Bootstrap,
    Backbone,
    PGSessionModel) {
    
    var PGSigninView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._options = options;
            this._addModelListeners();
        },

        events: {
            'click #pgsignin-signin'  : "_onSignin",
            'click #pgsignin-register': "_onRegister",
            'keyup'                   : "_onKeyUp",
            'click .nav-tabs li a'    : "_hideStatus"
        },

        // If there is no signin, then show the view.
        render: function() {
            if (!this._everRendered) {
                this._everRendered = true;

                // Initialize the tabs
                $("#pgsignin-tabs").tabs();
            }
            this._showOrHide();
        },

        // Listen for changes: show or hide the form depending on whether
        // or not there is a user (name === "unknown" is the trigger)
        _addModelListeners: function() {
            this._options.pgPlayerModel.on("change:state", _.bind(this._showOrHide, this));
        },

        _showOrHide: function() {
            if (this._options.pgPlayerModel.get('state') === 'static') {
                this._hideStatus();
                this._isShowing = (this._options.pgPlayerModel.get('username') === "unknown");
                if (this._isShowing) {
                    $(".form-signin").fadeIn(500, function() { $("#pgsignin-signin-name").focus(); });
                } else
                    $(".form-signin").fadeOut(500);
            } else {
                var status = '';
                switch (this._options.pgPlayerModel.get('state')) {
                    case 'signing-in': status = "Signing in..."; break;
                    case 'registering': status = "Registering..."; break;
                }
                this._showStatus(status);
            }
        },

        // Implementation of 'esc' and 'return' for submitting form, need to do
        // it manually because it's not really a form.
        _onKeyUp: function(e) {
            // Regardless of key, we don't do anything if it's working
            // om a signin or register.
            if (this._options.pgPlayerModel.get('state') !== 'static')
                return;

            switch (e.keyCode) {
                case 13: // return: confirm the form: figure out which tab
                    var $tab = $('.nav-tabs li.active a');
                    var href = $tab.attr('href');
                    switch(href) {
                        case "#login"   : this._onSignin(e); break;
                        case "#register": this._onRegister(e); break;
                    }
                break;

                case 27: // esc: empty the form
                    $('.pgsignin-input').val("");
                break;
            }
        },

        _onSignin: function(e) {
            if (this._isSigningInOrRegistering()) return;
            $('body').removeClass('pg-user-not-signed-in').addClass('pg-user-signing-in');

            this._hideStatus();

            var username = $("#pgsignin-signin-name").val();
            if (!username) {
                return this._showStatus("Username is required!");
            }
            var password = $("#pgsignin-signin-password").val();
            if (!password) {
                return this._showStatus("Password is required!");
            }

            this._signInOrRegister('signing-in', username, password);
        },

        _onRegister: function(e) {
            if (this._isSigningInOrRegistering()) return;
            $('body').removeClass('pg-user-not-signed-in').addClass('pg-user-signing-in');

            this._hideStatus();

            var username = $("#pgsignin-register-name").val();
            if (!username) {
                return this._showStatus("Username is required!");
            }
            var password = $("#pgsignin-register-password").val();
            if (!password) {
                return this._showStatus("Password is required!");
            }
            var passwordVerify = $("#pgsignin-register-password-verify").val();
            if (!passwordVerify) {
                return this._showStatus("Password verification is required!");
            }
            if (passwordVerify != password) {
                return this._showStatus("Passwords don't match!");
            }

            this._signInOrRegister('registering', username, password);
        },

        _showStatus: function(err) {
            $("#pgsignin-error-message").text(err);
            $("#pgsignin-error-message").css("visibility", "visible");
        },

        _hideStatus: function() {
            $("#pgsignin-error-message").css('visibility', "hidden");
        },

        _isSigningInOrRegistering: function() {
            var $body = $('body');
            return $body.hasClass('signing-in');
        },

        _signInOrRegister: function(state, username, password) {
            var isRegister = state === 'registering',
                promise,
                sModel = this._options.pgSessionModel,
                pModel = this._options.pgPlayerModel;

            // Update the player model for signing in or registering, and
            // make sure the buttons know not to do anything.
            pModel.set({
                state: state,
                username: username,
                password: password
            });

            if (isRegister) {
                promise = sModel.register(pModel);
            } else {
                promise = sModel.login(pModel);
            }

            promise
                .then(_.bind(function() {
                    pModel.set('state', 'signed-in');
                    $('body').removeClass('pg-user-signing-in').addClass('pg-user-signed-in');
                    this._hideStatus();
                }, this))
                .fail(_.bind(function() {
                    pModel.set('state', 'not-signed-in');
                    $('body').removeClass('pg-user-signing-in').addClass('pg-user-not-signed-in');
                    this._showStatus(isRegister ? "Registration failed." : "Signin failed");
                }, this));
        }

    });

    return PGSigninView;
});
