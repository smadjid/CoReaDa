'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Project = new Module('project');

var nodemailer = require('nodemailer');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Project.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Project.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Project.menus.add({
    title: 'project example page',
    link: 'project example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Project.aggregateAsset('css', 'project.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Project.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Project.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Project.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Project;
});
