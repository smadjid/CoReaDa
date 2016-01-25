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
    .get(auth.isMongoId, courses.show)
    .put(auth.isMongoId, auth.requiresLogin, hasAuthorization, hasPermissions, courses.update)
    .delete(auth.isMongoId, auth.requiresLogin, hasAuthorization, hasPermissions, courses.destroy);


  app.route('/api/tasks/add/:courseId/:chapterId/:partId/:factId')
      .post(auth.requiresLogin, hasPermissions,courses.addTodo);
  
  app.route('/api/course/tasks/edit/:courseId/:factId/:todoId')
      .post(auth.requiresLogin, hasPermissions,courses.editCourseTodo);
    app.route('/api/chapter/tasks/edit/:courseId/:chapterId/:factId/:todoId')
      .post(auth.requiresLogin, hasPermissions,courses.editChapterTodo);
    app.route('/api/part/tasks/edit/:courseId/:chapterId/:partId/:factId/:todoId')
      .post(auth.requiresLogin, hasPermissions,courses.editPartTodo);

    app.route('/api/course/tasks/delete/:courseId/:factId/:todoId')
      .delete(auth.requiresLogin, hasPermissions,courses.removeCourseTodo);
    app.route('/api/chapter/tasks/delete/:courseId/:chapterId/:factId/:todoId')
      .delete(auth.requiresLogin, hasPermissions,courses.removeChapterTodo);
    app.route('/api/part/tasks/delete/:courseId/:chapterId/:partId/:factId/:todoId')
      .delete(auth.requiresLogin, hasPermissions,courses.removePartTodo);

  // Finish with setting up the courseId param
  app.param('courseId', courses.course);
};
