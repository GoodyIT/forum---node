var categories = require('./src/categories.js'),
    templates = require('./public/src/templates.js'),
    webserver = require('./src/webserver.js'),
    websockets = require('./src/websockets.js'),
    fs = require('fs');

DEVELOPMENT = true;

global.configuration = {};
global.templates = {};

(function(config) {
    config['ROOT_DIRECTORY'] = __dirname;

    templates.init();
    templates.ready(function() {
        webserver.init();
    });

    //setup scripts to be moved outside of the app in future.
    function setup_categories() {
        console.log('Checking categories...');
        categories.get(function(data) {
            if (data.categories.length === 0) {
                console.log('Setting up default categories...');

                fs.readFile(config.ROOT_DIRECTORY + '/install/data/categories.json', function(err, default_categories) {
                    default_categories = JSON.parse(default_categories);
                    
                    for (var category in default_categories) {
                        categories.create(default_categories[category]);
                    }
                });

            } else console.log('Good.');
        });
    }


    setup_categories();

    

}(global.configuration));