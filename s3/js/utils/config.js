/*
*
* @class config
*
* configuration model.
*
*/

define([], function() {

    return {
        mock: true,

        mockCookie: '; pg-session-hash=session-hash-1',

        mockGames: [
            {
                gameHash: 'game-hash-1',
                players: 'rudi|dave',
                score: [ 3, 7 ],
                startTime: 1411356078910
            },
            {
                gameHash: 'game-hash-2',
                players: 'computer|rudi',
                score: [ 20, 6 ],
                startTime: 1421556078910
            },
            {
                gameHash: 'game-hash-3',
                players: 'dave|rudi',
                score: [ 2, 7 ],
                startTime: 1431656078910
            },
            {
                gameHash: 'game-hash-4',
                players: 'rudi|jen',
                score: [ 14, 14 ],
                startTime: 1441756078910
            },
        ]
    };

});
