define([], function() {
    return {
        games:
            '<table class="table table-striped pg-games-table">' +
                '<tr class="pg-games-row-header">' +
                    '<th class="pg-games-header-opponent">Opponent</th>' +
                    '<th class="pg-games-header-start-time">Started</th>' +
                    '<th class="pg-games-header-score">Score</th>' +
                '</tr>' +
            '</table>',

        game:
            '<td><a class="pg-games-row-opponent" href="#"><%- opponent %></a></td>' +
            '<td><span class="pg-games-row-start-time"><%= startTime %></span></td>' +
            '<td><span class="pg-games-row-score"><%= score %></span></td>',
    };
});