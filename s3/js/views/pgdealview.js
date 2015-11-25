/*
*
* @class PGDealView
*
* This file controls what is seen for a single player's 3 hands.
*/

define([
    'classes/pgtile',
    'models/pghandmodel',
    'views/pgbaseview',
    'views/pghandview'
], function(
    PGTile,
    PGHandModel,
    PGBaseView,
    PGHandView
) {
    
    var PGDealView = PGBaseView.extend({

        events: {
            'click .pgswitchhands-btn'     : "_switchHands",
            'click .pg-deal-preview-hands' : "_previewHands",
            'click .pg-deal-tiles-are-set' : "_tilesAreSet",
        },

        _addModels: function() {
            var o = this._options;
            o.pgDealUIModel = new PGDealUIModel({
                pgDealModel: this.pgDealModel,
                isPlayer: o.isPlayer
            });
        },

        // If there is no signin, then show the view.
        _addChildElements: function() {
            var $deal = this.$el;

            // Get the contents of the deal from the template.
            var $hands = $(this._dealTemplate);
            $deal.append($hands);

            // There are three hands, each with a model.
            this._handViews = [];
            for (var hvi = 0; hvi < 3; hvi++) {
                this._handViews.push(new PGHandView({
                    el: $deal.find('.pghand')[hvi],
                    handModel: o.pgDealModel.get('handmodels')[hvi],
                    index: hvi
                }));
            }

            // The 'events' was parsed before we created our view; this call
            // reparse it to get the views we just created.
            this.delegateEvents();

            _.each(this._handViews, function(handView) { handView.render(); });
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options;

            // If the state changes as a result of clicking one of the buttons,
            // update the state of the buttons.
            o.pgDealModel.on('change:state',
                _.bind(function() {
                    switch (o.pgDealModel.get('state')) {
                        case "thinking":
                            o.pgDealModel.get('handmodels').forEach(function(handModel) {
                                handModel.unpreviewTiles();
                            });
                            this.$el.find(".pg-deal-preview-hands").text("Preview Hands");
                            this.$el.find('.pg-deal-preview-hands').removeAttr('disabled');
                            this.$el.find('.pg-deal-tiles-are-set').attr('disabled', true);
                            this.$el.removeClass('pg-no-manipulate');
                        break;
                        case "previewing":
                            o.pgDealModel.get('handmodels').forEach(function(handModel) {
                                handModel.previewTiles();
                            });
                            this.$el.find(".pg-deal-preview-hands").text("Reconsider");
                            this.$el.find('.pg-deal-tiles-are-set').removeAttr('disabled');
                            this.$el.addClass('pg-no-manipulate');
                        break;
                    }
                }, this)
            );

            // If any of the handmodel states change, make sure we're in "thinking".
            o.pgDealModel.get('handmodels').forEach(
                _.bind(function(handModel) {
                    handModel.on('change:tiles',
                        _.bind(function() {
                            o.pgDealModel.set('state', "thinking");
                        }, this)
                    );
                }, this)
            );

            if (this._gameModel) {
                this._gameModel.on("change:state", _.bind(function() { this._handleGameState(); }, this));
            }
        },


        orderSets: function() {
            var handModels = o.pgDealModel.get('handmodels');
            var sets = [
                handModels[0].pgSet(),
                handModels[1].pgSet(),
                handModels[2].pgSet()
            ];
            var sads = [
                sets[0].sumAndDiff().sum,
                sets[1].sumAndDiff().sum,
                sets[2].sumAndDiff().sum
            ];

            var self = this;
            function switchSad(i) {
                var temp = sads[i];
                sads[i] = sads[i+1];
                sads[i+1] = temp;
                self._switchHandsEx(i);
            }
            if (sads[0] < sads[1]) switchSad(0);
            if (sads[1] < sads[2]) switchSad(1);
            if (sads[0] < sads[1]) switchSad(0);
        },

        _switchHands: function(e) {
            var whichHand = parseInt($(e.target).attr('data-handindex'), 10);
            this._switchHandsEx(whichHand);
        },

        _switchHandsEx: function(whichHand) {
            var handModels = o.pgDealModel.get('handmodels');
            var modelOne = handModels[whichHand];
            var modelTwo = handModels[whichHand+1];
            var tilesOne = modelOne.get('tile_indexes');
            var tilesTwo = modelTwo.get('tile_indexes');
            modelOne.set('tile_indexes', tilesTwo);
            modelTwo.set('tile_indexes', tilesOne);
        },

        _dealTemplate:
            '<div class="pg-deal-buttons">' +
                '<div><button type="button" class="pg-deal-preview-hands btn btn-primary btn-sm">Preview Hands</button></div>' +
                '<div><button type="button" class="pg-deal-tiles-are-set btn btn-primary btn-sm">Tiles are Set</button></div>' +
            '</div>' +
            '<div class="pg-deal-hands">' +
                '<span class="pg-handpoints pg-handpoints-3">3</span>' +
                '<div id="pghand-0" class="pghand"></div>' +
                '<span class="pg-handpoints pg-handpoints-2">2</span>' +
                '<div id="pghand-1" class="pghand"></div>' +
                '<span data-handindex="0" class="pg-tile-manipulate-control pgtexticon pgswitchhands-btn pgswitchhands-0-btn">&#59215;</span>' +
                '<span class="pg-handpoints pg-handpoints-1">1</span>' +
                '<div id="pghand-2" class="pghand"></div>' +
                '<span data-handindex="1" class="pg-tile-manipulate-control pgtexticon pgswitchhands-btn pgswitchhands-1-btn">&#59215;</span>' +
            '</div>',

        _previewHands: function(e) {
            // Double-duty: next-deal or preview-hands
            var gameState = this._gameModel.get('state');
            if (gameState === "ready_for_next_deal") {
                o.pgDealModel.get('handmodels').forEach(function(handModel) {
                    handModel.unpreviewTiles();
                });
                this._gameModel.set('state', "new_deal_asked_for");
            } else {
                var newState = o.pgDealModel.get('state');
                switch(newState) {
                    case "thinking":    // going to 'previewing'
                        newState = "previewing";
                    break;
                    case "previewing":    // going to 'thinking'
                        newState = "thinking";
                    break;
                }
                o.pgDealModel.set('state', newState);
            }
        },

        _tilesAreSet: function(e) {
             o.pgDealModel.set('state', 'finished_setting_tiles');
        },

        _handleGameState: function() {
          var $handsButton = $(".pg-deal-preview-hands");
            switch (this._gameModel.get('state')) {
                case "ready_for_next_deal":
                    $handsButton.text("Next Deal");
                    this.$el.find('.pg-deal-preview-hands').removeAttr('disabled');
                break;

                case "just_dealt":
                    $handsButton.text("Preview Hands");
                    $(".pg-deal-tiles-are-set").attr('disabled', true);
                    o.pgDealModel.set('state', "thinking");
                break;

                case "scoring":
                    this.$el.find('.pg-deal-buttons button').attr('disabled', true);
                    this.$el.addClass('pg-no-manipulate');
                break;

                default:
                    $handsButton.text("Preview hands");
                break;
            }
        }

    });

    return PGDealView;
});
