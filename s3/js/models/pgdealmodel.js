/*
*
* @class PGDealModel
*
* This file defines the deal that a single player (or opponent) gets
*/

define([
    'utils/config',
    'models/pgbasemodel'
],
function(
    config,
    PGBaseModel
) {
    
    var PGDealModel = PGBaseModel.extend({

        defaults: {
            'dealID': null
        },

        _addModelListeners: function() {
            this.listenTo(this, 'change:dealID', _.bind(this._dealIDChanged, this));
        },

        _dealIDChanged: function(model, newValue) {
            this.fetch();
        },

        idAttribute: 'dealID',

        urlBasePath: function() {
            return '/game/' + this.gameHash() + '/deal/' + this.dealIndex();
        },

        urlPath: function() {
            return this.urlBasePath() + '/player';
        },

        toJSON: function() {
            return _.pick(this.attributes, 'tiles', 'situation');
        },

        // Convenience functions
        gameHash: function() {
            return this.get('dealID').split('#')[0];
        },

        dealIndex: function() {
            return this.get('dealID').split('#')[1];
        },

        tileOfIndex: function(index) {
            return this.get('tiles')[index];
        },

        // Mock values
        mockFetchResponse: function() {
            return config.mockDeals[this.get('dealID')];
        }

    });

    return PGDealModel;
});
