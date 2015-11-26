/*
*
* @class pgplayermodel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([
    'models/ui/pguimodel'
], function(
    PGUIModel
) {
    
    var PGDealUIModel = PGUIModel.extend({

    });

    return PGDealUIModel;
});
