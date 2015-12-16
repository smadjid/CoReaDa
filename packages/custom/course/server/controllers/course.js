'use strict';

/**
 * Module dependencies. 
 */
var mongoose = require('mongoose'),    
    Course = mongoose.model('CourseDB'),
    config = require('meanio').loadConfig(),
    _ = require('lodash');


function getTodos(res){
    Todo.find(function(err, todos) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(todos); // return all todos in JSON format
        });
};

function seedData(res){
 var todo =  Todo.create({  text : "seed",done : false})
 var part =  Part.create({id : 166 ,part_id : 1, title : 'titre', todos : [todo]})
 
};

function getOneTodo(res){
    Todo.find(function(err, todos) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(todos); // return all todos in JSON format
        });
};


module.exports = function(Courses) {
    return {
        
        locate: function(req, res) {
            // use mongoose to get teh course
            Course.find(function(err, course) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(course); // return the course in JSON format 
        });
            

        },


        /**
         * get todos
         */
        getTodos: function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
        	if(err) return next("Error finding the course.");	
        	
        	if(req.params.partId==0){
        		res.json(_course.todos); 
        	}
        	else{
        		var part = _course.parts.id(req.params.partId);
        		res.json(_part.todos); 
        	}        	
        	
        	})
        },

        /**
         * Create a todo
         */
        addTodo: function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
        	if(err) return next("Error finding the course.");	
        	
        	if(req.params.partId==0){
        		_course.todos.push(req.body);
        		_course.save();
        	}
        	else{
        		var part = _course.parts.id(req.params.partId);
        		part.todos.push(req.body);
        		part.save();	
        		_course.save();
        	}        	
        	

        	res.json(_course);
        	})
        },
        /**
         * Edit a todo
         */
        editTodo: function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
        	if(err) return next("Error finding the course.");	
        	
        	if(req.params.courseId==0){
        		_course.todos.replaceOne({'_id':req.params.todoId},req.body);
        	}
        	else{
        		var part = _course.parts.id(req.params.partId);
        		part.todos.push(req.body);
        		part.todos.replaceOne({'_id':req.params.todoId},req.body);
        		part.save();	
        	}
        	
        	_course.save();
        	})
        },
        // delete a todo
        destroyTodo:function(req, res) {
            console.log(req.params.todoId);
            Todo.remove({
            _id : req.params.todoId
        }, function(err, todo) {
            if (err)
                res.send(err);

            getTodos(res);
        });

        },
        /**
         * Get a Todo
         */
        locateTodo: function(req, res) {
            // use mongoose to get all todos in the database
            getOneTodo(res);
            

        },
       /**
         * List of Todos
         */
        allTodos: function(req, res) {
            // use mongoose to get all todos in the database
            getTodos(res);
            

        },

        seedTodos: function(req, res) {
            // use mongoose to get all todos in the database
            seedData(res);
            

        },

  
       

        seed: function(req, res) {
           Course.create({  
            title : "Nodejs",
            version : 1.0,
            parts:[
            {
                id:1,
                part_id:1,
                title:'Part 1',
                facts:[
                {
                    name:'error1',
                    classof:'Reading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Reading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'error3',
                    classof:'Reading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Reading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Rereading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Rereading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Rereading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Rereading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Transition',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Transition',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Transition',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Transition',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Stop',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Stop',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Stop',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Stop',
                    type:'warning',
                    value:'value2'
                }
                ]
            },
            {
                id:2,
                part_id:2,
                title:'Part 2',
                facts:[
                {
                    name:'error1',
                    classof:'Reading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Reading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Reading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Reading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Rereading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Rereading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Rereading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Rereading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Transition',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Transition',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Transition',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Transition',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Stop',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Stop',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Stop',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Stop',
                    type:'warning',
                    value:'value2'
                }
                ]
            },
            {
                id:3,
                part_id:3,
                title:'Part 3',
                facts:[
                {
                    name:'error1',
                    classof:'Reading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Reading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Reading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Reading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Rereading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Rereading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Rereading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Rereading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Transition',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Transition',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Transition',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Transition',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Stop',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Stop',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Stop',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Stop',
                    type:'warning',
                    value:'value2'
                }
                ]
            },
            {
                id:4,
                part_id:4,
                title:'Part 4',
                facts:[
                {
                    name:'error1',
                    classof:'Reading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Reading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Reading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Reading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Rereading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Rereading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Rereading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Rereading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Transition',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Transition',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Transition',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Transition',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Stop',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Stop',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Stop',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Stop',
                    type:'warning',
                    value:'value2'
                }
                ]
            },
            {
                id:5,
                part_id:5,
                title:'Part 5',
                facts:[
                {
                    name:'error1',
                    classof:'Reading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Reading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Reading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Reading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Rereading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Rereading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Rereading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Rereading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Transition',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Transition',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Transition',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Transition',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Stop',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Stop',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Stop',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Stop',
                    type:'warning',
                    value:'value2'
                }
                ]
            },
            {
                id:6,
                part_id:6,
                title:'Part 6',
                facts:[
                {
                    name:'error1',
                    classof:'Reading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Reading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Reading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Reading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Rereading',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Rereading',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Rereading',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Rereading',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Transition',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Transition',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Transition',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Transition',
                    type:'warning',
                    value:'value2'
                },
                {
                    name:'error1',
                    classof:'Stop',
                    type:'issue',
                    value:'value1'
                },
                {
                    name:'error2',
                    classof:'Stop',
                    type:'issue',
                    value:'value2'
                },
                {
                    name:'warn1',
                    classof:'Stop',
                    type:'warning',
                    value:'value1'
                },
                {
                    name:'warn2',
                    classof:'Stop',
                    type:'warning',
                    value:'value2'
                }
                ]
            }


            ]

        }, function(err, todo) {
            if (err)
                res.send(err);

            res.send(todo);

        });

          

        }
    };
}