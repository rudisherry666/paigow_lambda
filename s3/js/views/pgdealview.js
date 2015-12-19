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
            'click .pgswitchhands-btn'        : "_switchHands",
            'click .pg-deal-preview-hands'    : "_previewHands",
            'click .pg-deal-un-preview-hands' : "_unPreviewHands",
            'click .pg-deal-tiles-are-set'    : "_tilesAreSet",
            'click .pg-deal-next-deal'        : "_nextDeal",
            'click .pg-deal-another-game'     : "_anotherGame"
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
                    pgDealUIModel: o.pgDealUIModel,
                    isPlayer: o.isPlayer,
                    handIndex: hvi,
                }));
            }

            _.each(o.pgHandViews, function(pgHandView) {
                o.pgHandViews.push(pgHandView);
                pgHandView.render();
            });

            // We start with 'thinking'.
            if (o.isPlayer) {
                this._setClass('pg-deal-thinking');
            } else {
                this._setClass('pg-deal-opponent pg-hidden-hand');
            }

            return this._super();
        },

        // Listen for changes
        _addModelListeners: function() {
            var o = this._options;

            // If the state changes as a result of clicking one of the buttons,
            // update the state of the buttons.
            this.listenTo(o.pgDealUIModel, 'change:state',
                this._onDealStateChange);

            // If any of the handmodel states change, make sure we're i
            // "thinking".  TODO: use event bus?
            _.each(o.pgHandViews, _.bind(function(pgHandView) {
                this.listenTo(pgHandView.model, 'change:tiles',
                    this._onHandStateChange);
                }, this)
            );

            return this._super();
        },

        _setClass: function(newClass) {
            this.$el.removeClass('pg-deal-thinking pg-deal-previewing pg-deal-deal-done pg-deal-game-done')
                    .addClass(newClass);
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
            var o = this._options,
                hv = o.pgHandViews,
                ti1 = hv[whichHand].tileIndexes(),
                ti2 = hv[whichHand+1].tileIndexes();
            hv[whichHand].setTileIndexes(ti2);
            hv[whichHand+1].setTileIndexes(ti1);
        },

        // User clicked 'Preview Handls'
        _previewHands: function(e) {
            var o = this._options;
            this._setClass('pg-deal-previewing');
            o.pgDealUIModel.set('state', 'previewing');
        },

        _unPreviewHands: function(e) {
            var o = this._options;
            this._setClass('pg-deal-thinking');
            o.pgDealUIModel.set('state', 'thinking');
        },

        _tilesAreSet: function(e) {
            var o = this._options;
            this._setClass('pg-deal-tiles-are-set');
            o.pgDealUIModel.set('state', 'tiles_are_set');
        },

        _nextDeal: function(e) {
            var o = this._options;
            this._setClass('pg-deal-dealing');
            o.eventBus.trigger('deal:ready_for_next_deal');
        },

        _anotherGame: function(e) {
            var o = this._options;
            this._setClass('pg-deal-dealing');
            o.eventBus.trigger('deal:ready_for_next_game');
        },

        _onHandStateChange: function(model, newwState) {
            var o = this._options;
            o.pgDealUIModel.set('state', "thinking");
        },

        _onDealStateChange: function(model, newState) {
            var o = this._options;
            switch (newState) {
                case 'tiles_are_set':
                    // User clicked tiles-are-set.
                    o.eventBus.trigger('deal:tiles_are_set');
                break;
                case "thinking":
                    this.$el.removeClass('pg-no-manipulate');
                break;
                case "previewing":
                    this.$el.addClass('pg-no-manipulate');
                break;
            }
        },

    });

    return PGDealView;
});
