/*
*
* @class PGGameUIModel
*
* The state of the UI for the game.
*
*/

define([
    'models/ui/pguimodel'
], function(
    PGUIModel
) {
    
    var PGGameUIModel = PGUIModel.extend({

        states: {
            READY_FOR_NEXT_DEAL:    'READY_FOR_NEXT_DEAL',
            JUST_DEALT:             'JUST_DEALT',
            NEW_DEAL_ASKED_FOR:     'NEW_DEAL_ASKED_FOR',
            SCORING:                'SCORING'
        },

    });

    return PGGameUIModel;
});
