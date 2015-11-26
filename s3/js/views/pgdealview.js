/*
*
* @class PGDealView
*
* This file controls what is seen for a single player's 3 hands.
*/

define([
    'views/pgbaseview',
    'models/ui/pgdealuimodel',
    'views/pghandview',
    'templates/pggameview'
], function(
    PGBaseView,
    PGDealUIModel,
    PGHandView,
    template
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
                pgDealModel: this.pgDealModel
            });

            return this._super();
        },

        // If there is no signin, then show the view.
        _addChildElements: function() {
            var o = this._options;

            this.$el.append(_.template(template.deal)({}));

            // There are three hands, each with a model.
            o.pgHandViews = [];
            for (var hvi = 0; hvi < 3; hvi++) {
                o.pgHandViews.push(new PGHandView({
                    el: this.$('.pghand')[hvi],
                    eventBus: o.eventBus,
                    pgDealModel: o.pgDealModel,
                    pgDealView: o.pgDealView,
                    isPlayer: o.isPlayer,
                    handIndex: hvi,
                }));
            }

            _.each(o.pgHandViews, function(handView) {
                handView.render();
            });

            return this._super();
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options;

            // If the state changes as a result of clicking one of the buttons,
            // update the state of the buttons.
            o.pgDealUIModel.on('change:state',
                _.bind(function() {
                    switch (o.pgDealUIModel.get('state')) {
                        case "thinking":
                            o.pgDealUIModel.get('handmodels').forEach(function(handModel) {
                                handModel.unpreviewTiles();
                            });
                            this.$(".pg-deal-preview-hands").text("Preview Hands");
                            this.$('.pg-deal-preview-hands').removeAttr('disabled');
                            this.$('.pg-deal-tiles-are-set').attr('disabled', true);
                            this.$el.removeClass('pg-no-manipulate');
                        break;
                        case "previewing":
                            o.pgDealUIModel.get('handmodels').forEach(function(handModel) {
                                handModel.previewTiles();
                            });
                            this.$(".pg-deal-preview-hands").text("Reconsider");
                            this.$('.pg-deal-tiles-are-set').removeAttr('disabled');
                            this.$el.addClass('pg-no-manipulate');
                        break;
                    }
                }, this)
            );

            // If any of the handmodel states change, make sure we're in "thinking".
            // TODO: use event bus?
            _.each(o.pgHandViews, _.bind(function(pgHandView) {
                    this.listenTo(pgHandView.model, 'change:tiles',
                        function() {
                            o.pgDealUIModel.set('state', "thinking");
                        }
                    );
                }, this)
            );

            // if (this._gameModel) {
            //     this._gameModel.on("change:state", _.bind(function() { this._handleGameState(); }, this))
            // }

            return this._super();
        },


        orderSets: function() {
            var handModels = o.pgDealUIModel.get('handmodels');
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
            var handModels = o.pgDealUIModel.get('handmodels');
            var modelOne = handModels[whichHand];
            var modelTwo = handModels[whichHand+1];
            var tilesOne = modelOne.get('tile_indexes');
            var tilesTwo = modelTwo.get('tile_indexes');
            modelOne.set('tile_indexes', tilesTwo);
            modelTwo.set('tile_indexes', tilesOne);
        },

        _previewHands: function(e) {
            // Double-duty: next-deal or preview-hands
            var gameState = this._gameModel.get('state');
            if (gameState === "ready_for_next_deal") {
                o.pgDealUIModel.get('handmodels').forEach(function(handModel) {
                    handModel.unpreviewTiles();
                });
                this._gameModel.set('state', "new_deal_asked_for");
            } else {
                var newState = o.pgDealUIModel.get('state');
                switch(newState) {
                    case "thinking":    // going to 'previewing'
                        newState = "previewing";
                    break;
                    case "previewing":    // going to 'thinking'
                        newState = "thinking";
                    break;
                }
                o.pgDealUIModel.set('state', newState);
            }
        },

        _tilesAreSet: function(e) {
             o.pgDealUIModel.set('state', 'finished_setting_tiles');
        },

        _handleGameState: function() {
          var $handsButton = $(".pg-deal-preview-hands");
            switch (this._gameModel.get('state')) {
                case "ready_for_next_deal":
                    $handsButton.text("Next Deal");
                    this.$('.pg-deal-preview-hands').removeAttr('disabled');
                break;

                case "just_dealt":
                    $handsButton.text("Preview Hands");
                    $(".pg-deal-tiles-are-set").attr('disabled', true);
                    o.pgDealUIModel.set('state', "thinking");
                break;

                case "scoring":
                    this.$('.pg-deal-buttons button').attr('disabled', true);
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
