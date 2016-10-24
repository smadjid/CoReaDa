'use strict';

module.exports = function(Courses, app) {
  
  var courses = require('../controllers/courses')(Courses);

  app.route('/api/courses')
    .get(courses.all);
  app.route('/api/coreada/seed')
    .get(courses.seedcoreada);
  app.route('/api/coreada/log')
    .get(courses.coreadalog);
  app.route('/api/coreada/accesslogs')
    .get(courses.sendaccesslogs);
  app.route('/api/coreada/resetlogs')
    .post(courses.resetlogs);


  app.route('/api/courses/:courseId')
    .get(courses.show);
  app.route('/api/seed/:courseTitle')
      .get(courses.seed);
  app.route('/api/seedall')
      .get(courses.seedall);
  app.route('/api/find/:courseCode')
      .get(courses.find);


  app.route('/api/tasks/add/:courseId/:tomeId/:chapterId/:partId/:factId')
      .post(courses.addTodo);  
  app.route('/api/course/tasks/edit/:courseId/:factId/:todoId')
      .post(courses.editCourseTodo);

    app.route('/api/tome/tasks/edit/:courseId/:tomeId/:factId/:todoId')
      .post(courses.editTomeTodo);
      
    app.route('/api/chapter/tasks/edit/:courseId/:tomeId/:chapterId/:factId/:todoId')
      .post(courses.editChapterTodo);
    app.route('/api/part/tasks/edit/:courseId/:tomeId/:chapterId/:partId/:factId/:todoId')
      .post(courses.editPartTodo);

    app.route('/api/course/tasks/delete/:courseId/:factId/:todoId')
      .delete(courses.removeCourseTodo);
    app.route('/api/tome/tasks/delete/:courseId/:tomeId/:factId/:todoId')
      .delete(courses.removeTomeTodo);
    app.route('/api/chapter/tasks/delete/:courseId/:tomeId/:chapterId/:factId/:todoId')
      .delete(courses.removeChapterTodo);
    app.route('/api/part/tasks/delete/:courseId/:tomeId/:chapterId/:partId/:factId/:todoId')
      .delete(courses.removePartTodo);

    app.route('/api/courses/log/:courseId')
      .post(courses.addLog);

    app.route('/api/feedback')
    .post(courses.feedback);

  // Finish with setting up the courseId param
  app.param('courseId', courses.course);
};
