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
Courses.register(function(app, auth, database) {
  //app.set('views',__dirname + '/server/views');
  
  Courses.routes(app, auth, database);


  Courses.aggregateAsset('js',"../lib/d3/d3.min.js");
  
  
  Courses.aggregateAsset('js',"../lib/ng-dialog/js/ngDialog.min.js");
  Courses.aggregateAsset('css',"../lib/ng-dialog/css/ngDialog.css");
  Courses.aggregateAsset('css',"../lib/ng-dialog/css/ngDialog-theme-default.css");
  Courses.aggregateAsset('css',"../lib/ng-dialog/css/ngDialog-theme-plain.css");
  

  Courses.aggregateAsset('css', '../lib/angular-xeditable/dist/css/xeditable.css');
  Courses.aggregateAsset('js', '../lib/angular-xeditable/dist/js/xeditable.js');

   Courses.aggregateAsset('js',"../lib/chroma-js/chroma.js");

     Courses.aggregateAsset('js',"../lib/sweetalert/dist/sweetalert.min.js");
  Courses.aggregateAsset('css',"../lib/sweetalert/dist/sweetalert.css");

  Courses.aggregateAsset('js',"../lib/perfect-scrollbar/min/perfect-scrollbar.min.js");
  Courses.aggregateAsset('css',"../lib/perfect-scrollbar/min/perfect-scrollbar.min.css");
  Courses.aggregateAsset('js',"../lib/angular-perfect-scrollbar/src/angular-perfect-scrollbar.js");

  Courses.aggregateAsset('js',"../lib/angular-selector/dist/angular-selector.min.js");
  Courses.aggregateAsset('css',"../lib/angular-selector/dist/angular-selector.css");


  Courses.aggregateAsset('js',"../lib/angular-animate/angular-animate.min.js");



Courses.aggregateAsset('js',"../lib/nz-tour/dist/nz-tour.min.js");
Courses.aggregateAsset('css',"../lib/nz-tour/dist/nz-tour.min.css");

Courses.aggregateAsset('js',"../lib/v-accordion/dist/v-accordion.js");
Courses.aggregateAsset('css',"../lib/v-accordion/dist/v-accordion.css");

  

  
  Courses.aggregateAsset('css', 'courses.css');
  
  
    Courses.settings({
        'theme': 'bs3'
    }, function(err, settings) {
        //you now have the settings object
    });

 Courses.aggregateAsset('js',"../lib/d3/box.js");
  
  //Courses.angularDependencies(['xeditable','perfect_scrollbar','selector','ngAnimate']);
  Courses.angularDependencies(['ngSanitize','xeditable','perfect_scrollbar','selector','nzTour','ngDialog','vAccordion','ngAnimate']);

/*
	Courses.menus.add({
  title: "Guided tour",
  link: "course by id",
  menu: "main"
});*/
  return Courses;
});
