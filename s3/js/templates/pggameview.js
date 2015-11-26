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
                '<div class="pg-deal-buttons">' +
                    '<div><button type="button" class="pg-deal-preview-hands btn btn-primary btn-sm">Preview Hands</button></div>' +
                    '<div><button type="button" class="pg-deal-tiles-are-set btn btn-primary btn-sm">Tiles are Set</button></div>' +
                '</div>' +
                '<div class="pg-deal-hands">' +
                    '<span class="pg-handpoints pg-handpoints-3">3</span>' +
                    '<div id="pghand-0" class="pghand"></div>' +
                    '<span class="pg-handpoints pg-handpoints-2">2</span>' +
                    '<div id="pghand-1" class="pghand"></div>' +
                    '<span data-handindex="0" class="pg-tile-manipulate-control pgtexticon pgswitchhands-btn pgswitchhands-0-btn">&#59215;</span>' +
                    '<span class="pg-handpoints pg-handpoints-1">1</span>' +
                    '<div id="pghand-2" class="pghand"></div>' +
                    '<span data-handindex="1" class="pg-tile-manipulate-control pgtexticon pgswitchhands-btn pgswitchhands-1-btn">&#59215;</span>' +
                '</div>' +
            '</div>' +
            '<span class="pgicon">&#128257;</span>',

        hand:
            '<div class="pghand-tiles">' +
                '<span class="pg-tile-manipulate-control pgtexticon rotatetiles-btn">&#10226;</span>' +
                '<div class="pg2tile">' +
                    '<div>' +
                        '<div class="pgtile"></div>' +
                        '<div class="pgtile"></div>' +
                    '</div>' +
                    '<span class="pg2tile-label"></span>' +
                '</div>' +
                '<div class="pgtile-spacer"></div>' +
                '<div class="pg2tile">' +
                    '<div>' +
                        '<div class="pgtile"></div>' +
                        '<div class="pgtile"></div>' +
                    '</div>' +
                    '<span class="pg2tile-label"></span>' +
                '</div>' +
            '</div>',

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
