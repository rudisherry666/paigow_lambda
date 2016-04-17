/*
*
* @class PGBaseModel
*
* The base model on which all the others derive.  For now does nothing
* except mixin the fetches.
*
*/

define([
    'backbone',
    'backbone-super',
    'models/pgmodelmixin'
], function(
    Backbone,
    BackboneSuper,
    PGModelMixin
) {

    var PGBaseModel = Backbone.Model.extend({

        initialize: function(options) {
            this._super(options);

            this._addModelListeners();
        },

        _addModelListeners: function() {},

        parse: function(data) {
            if (!data) {
                console.log('ERROR: got no data from fetching!');
            } else if (data.errorMessage) {
                console.log('ERROR: error returned from server for ' + this.modelName + ': ' + data.errorMessage);
            }
            return this._super.apply(this, arguments);
        }

    });

    PGModelMixin.mixin(PGBaseModel.prototype, Backbone.Model);

    return PGBaseModel;
});
