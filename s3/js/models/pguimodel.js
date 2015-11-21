/*
*
* @class pguimodel
*
* This file is the base class for ui models
*/

define([
    'backbone'
], function(
    Backbone
) {
    
    var PGUIModel = Backbone.Model.extend({

        // This is not sync'ed with the server.
        fetch: function() {},
        save:  function() {},
        sync:  function() {}

    });

    return PGUIModel;
});
