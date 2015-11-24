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

    var PGBaseModel = Backbone.Model.extend({});
    PGModelMixin.mixin(PGBaseModel.prototype, Backbone.Model);

    return PGBaseModel;
});
