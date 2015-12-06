/*
*
* @class config
*
* configuration model.
*
*/

define([], function() {

    return {
        mock: false,

        mockCookie: '; pg-session-hash=session-hash-1',

        mockGames: [
            {
                gameHash: 'game-hash-4',
                players: 'rudi|jen',
                score: [ -1, -1 ],
                startTime: 1441756078910,
                lastDealIndex: 0
            },
            {
                gameHash: 'game-hash-3',
                players: 'dave|rudi',
                score: [ 2, 7 ],
                startTime: 1431656078910,
                lastDealIndex: 5
            },
            {
                gameHash: 'game-hash-2',
                players: 'computer|rudi',
                score: [ 20, 6 ],
                startTime: 1421556078910,
                lastDealIndex: 9
            },
            {
                gameHash: 'game-hash-1',
                players: 'rudi|dave',
                score: [ 3, 7 ],
                startTime: 1411356078910,
                lastDealIndex: 3
            },
        ],

        mockDeals: {
            'game-hash-4#0' : {
                dealID: 'game-hash-4#0',
                situation: 'TILES_NOT_SET',
                points: [ -1, -1 ],
                tiles: [
                     3, 12,  4, 22, 30, 18, 23,  1, 15, 16, 17, 18,
                     5, 26,  2, 31, 29, 17, 24, 19, 20, 21,  8,  6
                ]
            }
        }
    };

});
