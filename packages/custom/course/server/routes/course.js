'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Course, app, auth, database) {

  app.get('/api/course/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/api/course/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/api/course/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/api/course/example/render', function(req, res, next) {
    Course.render('index', {
      package: 'course'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
