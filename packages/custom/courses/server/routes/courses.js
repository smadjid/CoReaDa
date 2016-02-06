'use strict';

// Course authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && !req.course.user._id.equals(req.user._id)) {
    return res.status(401).send('User is not authorized');
  }
  next();
};

var hasPermissions = function(req, res, next) {

    req.body.permissions = req.body.permissions || ['authenticated'];

    for (var i = 0; i < req.body.permissions.length; i++) {
      var permission = req.body.permissions[i];
      if (req.acl.user.allowed.indexOf(permission) === -1) {
            return res.status(401).send('User not allowed to assign ' + permission + ' permission.');
        }
    }

    next();
};

module.exports = function(Courses, app, auth) {
  
  var courses = require('../controllers/courses')(Courses);

  app.route('/api/courses')
    .get(courses.all)
    .post(auth.requiresLogin, hasPermissions, courses.create);
  app.route('/api/courses/:courseId')
    .get(courses.show)
    .put(courses.update)
    .delete(auth.isMongoId, auth.requiresLogin, hasAuthorization, hasPermissions, courses.destroy);
  app.route('/api/seed/:courseTitle')
      .get(courses.seed);


  app.route('/api/tasks/add/:courseId/:tomeId/:chapterId/:partId/:factId')
      .post(courses.addTodo);
  
  app.route('/api/course/tasks/edit/:courseId/:factId/:todoId')
      .post(courses.editCourseTodo);
    app.route('/api/chapter/tasks/edit/:courseId/:tomeId/:factId/:todoId')
      .post(courses.editTomeTodo);
    app.route('/api/chapter/tasks/edit/:courseId/:tomeId/:chapterId/:factId/:todoId')
      .post(courses.editChapterTodo);
    app.route('/api/part/tasks/edit/:courseId/:tomeId/:chapterId/:partId/:factId/:todoId')
      .post(courses.editPartTodo);

    app.route('/api/course/tasks/delete/:courseId/:factId/:todoId')
      .delete(courses.removeCourseTodo);
    app.route('/api/chapter/tasks/delete/:courseId/:tomeId/:factId/:todoId')
      .delete(courses.removeTomeTodo);
    app.route('/api/chapter/tasks/delete/:courseId/:tomeId/:chapterId/:factId/:todoId')
      .delete(courses.removeChapterTodo);
    app.route('/api/part/tasks/delete/:courseId/:tomeId/:chapterId/:partId/:factId/:todoId')
      .delete(courses.removePartTodo);

  // Finish with setting up the courseId param
  app.param('courseId', courses.course);
};
