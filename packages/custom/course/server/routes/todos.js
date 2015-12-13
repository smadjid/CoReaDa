'use strict';

/* jshint -W098 */
// https://scotch.io/tutorials/creating-a-single-page-todo-app-with-node-and-angular



module.exports = function(Todos, app, auth, database) { 
  var todos = require('../controllers/todo')(Todos);
  // api ---------------------------------------------------------------------
    
// seed
    app.route('/api/seed')
      .get(todos.seed);

    // get all todos
    app.route('/api/todos')
      .get(todos.all)
      .post(todos.create);
    app.route('/api/todos/:todoId')
    //.get(todos.locate)
    //.put(tods.create)
    .delete(todos.destroy);

    // delete a todo
  
    
    
};
