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
    'models/pgmodelmixin'
], function(
    Backbone,
    PGModelMixin
) {

    var PGBaseModel = Backbone.Model.extend({});
    PGModelMixin.mixin(PGBaseModel.prototype, Backbone.Model);

    return PGBaseModel;
});
