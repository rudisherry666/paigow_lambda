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

        initialize: function() {
            this.set(this.defaults);
        },

        defaults: {},

        // This is not sync'ed with the server.
        fetch: function() {},
        save:  function() {},
        sync:  function() {}

    });

    return PGUIModel;
});
