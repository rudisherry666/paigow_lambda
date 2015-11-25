/*
*
* @class PGDealModel
*
* This file defines the deal that a single player (or opponent) gets
*/

define([
    'utils/config',
    'models/pgbasemodel',
    'models/pghandmodel'
],
function(
    config,
    PGBaseModel,
    PGHandModel
) {
    
    var PGDealModel = PGBaseModel.extend({

        defaults: {
            'dealID': null
        },

        _addModelListeners: function() {
            this.listenTo(this, 'change:dealID', _.bind(this._fetchChanged, this));
        },

        _fetchChanged: function(model, newValue) {
            this.fetch();
        },

        idAttribute: 'dealID',
        urlPath: function() {
            return '/game/' + this.gameHash() + '/deal/' + this.dealIndex();
        },

        // Convenience functions
        gameHash: function() {
            return this.get('dealID').split('#')[0];
        },

        dealIndex: function() {
            return this.get('dealID').split('#')[1];
        },

        // Mock values
        mockFetchResponse: function() {
            return config.deals[this.get('dealID')];
        }

    });

    return PGDealModel;
});
