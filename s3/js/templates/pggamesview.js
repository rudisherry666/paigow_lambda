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
            '<tr class="pg-games-row-game pg-games-row-hash-<%= gameHash %>">' +
                '<td class="pg-games-row-opponent"><a href="#"><%- opponent %></a></td>' +
                '<td class="pg-games-row-start-time"><%= startTime %></td>' +
                '<td class="pg-games-row-score"><%= score %></td>' +
            '</tr>'
    };
});
