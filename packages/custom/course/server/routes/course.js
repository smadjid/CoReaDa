'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Courses, app, auth, database) {

 var courses = require('../controllers/course')(Courses);
  // api ---------------------------------------------------------------------
    
// seed
    app.route('/api/courses/seed')
      .get(courses.seed);

    // get all todos
    app.route('/api/course/node')
      .get(courses.locate)
};
