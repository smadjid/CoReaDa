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
      .get(courses.locate);

    app.route('/api/tasks/get/:courseId/:partId')
      .get(courses.getTodos);

    app.route('/api/tasks/add/:courseId/:chapterId/:partId/:factId')
      .post(courses.addTodo);
    app.route('/api/tasks/delete/:courseId/:chapterId/:partId/:factId/:todoId')
      .delete(courses.removeTodo);
    app.route('/api/tasks/edit/:courseId/:chapterId/:partId/:factId/:todoId')
      .post(courses.editTodo);
    
};
