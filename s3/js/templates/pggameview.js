define([], function() {
    return {
        game:
            '<link href="css/pgdeal.css" rel="stylesheet">' +
            '<link href="css/pghand.css" rel="stylesheet">' +
            '<link href="css/pgtile.css" rel="stylesheet">' +
            '<link href="css/entypo.css" rel="stylesheet">' +
            '<div class="pgdeal pg-deal-player"></div>' +
            '<div class="pgdeal pg-deal-opponent"></div>',

        deal:
            '<div class="pgdeal-hands">' +
                '<div class="pghand pg-hand-1"></div>' +
                '<div class="pghand pg-hand-2"></div>' +
                '<div class="pghand pg-hand-3"></div>' +
            '</div>' +
            '<span class="pgicon">&#128257;</span>',

        hand:
            '<div class="pghand-tiles"></div>' +
                '<div class="pgtile <%= tileClass %>"></div>' +
            '<div class="pghand-name"><%= handName %></div>',

        tile:
            '<div class="pgdot pgdot-1"></div>' +
            '<div class="pgdot pgdot-2"></div>' +
            '<div class="pgdot pgdot-3"></div>' +
            '<div class="pgdot pgdot-4"></div>' +
            '<div class="pgdot pgdot-5"></div>' +
            '<div class="pgdot pgdot-6"></div>' +
            '<div class="pgdot pgdot-7"></div>' +
            '<div class="pgdot pgdot-8"></div>' +
            '<div class="pgdot pgdot-9"></div>' +
            '<div class="pgdot pgdot-10"></div>' +
            '<div class="pgdot pgdot-11"></div>' +
            '<div class="pgdot pgdot-12"></div>' +
            '<div class="pgdot pgdot-13"></div>' +
            '<div class="pgdot pgdot-14"></div>' +
            '<div class="pgdot pgdot-15"></div>' +
            '<div class="pgdot pgdot-16"></div>' +
            '<div class="pgdot pgdot-17"></div>' +
            '<div class="pgdot pgdot-18"></div>' +
            '<div class="pgdot pgdot-19"></div>' +
            '<div class="pgdot pgdot-20"></div>'
    };
});
