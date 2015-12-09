'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Course = new Module('course');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Course.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Course.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Course.menus.add({
    title: 'course example page',
    link: 'course example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Course.aggregateAsset('css', 'course.css');
  
  Course.aggregateAsset('css', '../lib/angular-xeditable/dist/css/xeditable.css');
  Course.aggregateAsset('js', '../lib/angular-xeditable/dist/js/xeditable.js');


  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages*/
    Course.settings({
        'theme': 'bs3'
    }, function(err, settings) {
        //you now have the settings object
    });

   /** // Another save settings example this time with no callback
    // This writes over the last settings.
    Course.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Course.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Course;
});
