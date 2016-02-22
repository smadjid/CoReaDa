'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Courses = new Module('courses');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Courses.register(function(app, auth, database, swagger) {

  //We enable routing. By default the Package Object is passed to the routes
  Courses.routes(app, auth, database);

  

  
  //We are adding a link to the main menu for all authenticated users
 /* Courses.menus.add({
    'roles': ['authenticated'],
    'title': 'Courses',
    'link': 'all courses'
  });*/
 


  Courses.events.defaultData({
    type: 'post',
    subtype: 'course'
  });

  

  Courses.aggregateAsset('js',"../lib/d3/d3.min.js");
  

  Courses.aggregateAsset('css', '../lib/angular-xeditable/dist/css/xeditable.css');
  Courses.aggregateAsset('js', '../lib/angular-xeditable/dist/js/xeditable.js');

   Courses.aggregateAsset('js',"../lib/chroma-js/chroma.js");

     Courses.aggregateAsset('js',"../lib/sweetalert/dist/sweetalert.min.js");
  Courses.aggregateAsset('css',"../lib/sweetalert/dist/sweetalert.css");

  Courses.aggregateAsset('js',"../lib/perfect-scrollbar/min/perfect-scrollbar.min.js");
  Courses.aggregateAsset('css',"../lib/perfect-scrollbar/min/perfect-scrollbar.min.css");
  Courses.aggregateAsset('js',"../lib/angular-perfect-scrollbar/src/angular-perfect-scrollbar.js");

  Courses.aggregateAsset('js',"../lib/d3/box.js");


  /*
  Courses.aggregateAsset('js',"../lib/nvd3/build/nv.d3.js");
  Courses.aggregateAsset('js',"../lib/angular-nvd3/dist/angular-nvd3.js");
  Courses.aggregateAsset('css',"../lib/nvd3/build/nv.d3.css");*/
  

  
  Courses.aggregateAsset('css', 'courses.css');
    Courses.settings({
        'theme': 'bs3'
    }, function(err, settings) {
        //you now have the settings object
    });

  // Only use swagger.add if /docs and the corresponding files exists
  swagger.add(__dirname);

  Courses.angularDependencies(['xeditable','perfect_scrollbar']);


	
  return Courses;
});
