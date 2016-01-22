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
  
  app.route('/api/course/tasks/edit/:courseId/:factId/:todoId')
      .post(courses.editCourseTodo);
    app.route('/api/chapter/tasks/edit/:courseId/:chapterId/:factId/:todoId')
      .post(courses.editChapterTodo);
    app.route('/api/part/tasks/edit/:courseId/:chapterId/:partId/:factId/:todoId')
      .post(courses.editPartTodo);

    app.route('/api/course/tasks/delete/:courseId/:factId/:todoId')
      .delete(courses.removeCourseTodo);
    app.route('/api/chapter/tasks/delete/:courseId/:chapterId/:factId/:todoId')
      .delete(courses.removeChapterTodo);
    app.route('/api/part/tasks/delete/:courseId/:chapterId/:partId/:factId/:todoId')
      .delete(courses.removePartTodo);
    
};
