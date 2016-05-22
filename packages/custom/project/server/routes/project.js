'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Project, app, auth, database) {

  var project = require('../controllers/project')(Project);

app.route('/api/project/feedback')
      .post(project.sendFeedback);

  app.get('/api/project/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });



  app.get('/api/project/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/api/project/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/api/project/example/render', function(req, res, next) {
    Project.render('index', {
      package: 'project'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
