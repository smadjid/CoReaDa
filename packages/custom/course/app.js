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
    title: 'course study',
    link: 'course example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  Course.aggregateAsset('js',"../lib/spin.js/spin.min.js");
  Course.aggregateAsset('css', 'course.css');
  
  Course.aggregateAsset('css', '../lib/angular-xeditable/dist/css/xeditable.css');
  Course.aggregateAsset('js', '../lib/angular-xeditable/dist/js/xeditable.js');

  Course.aggregateAsset('css',"../lib/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css");
  Course.aggregateAsset('js',"../lib/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js");
  Course.aggregateAsset('js',"../lib/ng-scrollbars/dist/scrollbars.min.js");


  Course.aggregateAsset('js',"../lib/v-accordion/dist/v-accordion.min.js");
  Course.aggregateAsset('css',"../lib/v-accordion/dist/v-accordion.min.css");

   Course.aggregateAsset('js',"../lib/sweetalert/dist/sweetalert.min.js");
  Course.aggregateAsset('css',"../lib/sweetalert/dist/sweetalert.css");

  Course.aggregateAsset('js',"../lib/perfect-scrollbar/min/perfect-scrollbar.min.js");
  Course.aggregateAsset('css',"../lib/perfect-scrollbar/min/perfect-scrollbar.min.css");
  Course.aggregateAsset('js',"../lib/angular-perfect-scrollbar/src/angular-perfect-scrollbar.js");


     
     Course.aggregateAsset('js',"../lib/angular-spinner/angular-spinner.js");
     


  Course.aggregateAsset('js',"../lib/chroma.js");


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
