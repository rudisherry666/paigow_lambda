/*
* The main require configuration for paigow.
*
* Taken from <http://requirejs.org/docs/api.html#config>
*
*/
requirejs.config({
    baseUrl: "js",
    paths: {
        'underscore': "xlib/underscore-1.6.0.min",
        'backbone': "xlib/backbone-1.1.2.min",
        // 'backbone': "lib/backbone",
        //'bootstrap': "lib/bootstrap-3.3.5.min",
        'bootstrap': "xlib/bootstrap-3.3.5",
        'jquery': "xlib/jquery-1.11.0.min",
        // 'jquery': "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min",
        'jquery-ui': "xlib/jquery-ui-1.10.4.custom.min"
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'jquery-ui': {
            deps: ['jquery']
        },
        'underscore': {
            exports: '_'
        }
    }
});

define(['pgapp'], function(PGApp) {
    var dummyApp = new PGApp();
});
