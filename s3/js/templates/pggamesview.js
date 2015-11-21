define([], function() {
    return {
        games:
            '<table class="table table-striped">' +
                '<tr>' +
                    '<th>Opponent</th>' +
                    '<th>Started</th>' +
                    '<th>Score</th>' +
                '</tr>' +
            '</table>',

        game:
            '<tr>' +
                '<td><%- opponent %></td>' +
                '<td><%= startTime %></td>' +
                '<td><%= score %></td>' +
            '</tr>'
    };
});
