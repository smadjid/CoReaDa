'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Course = mongoose.model('Course'),
    config = require('meanio').loadConfig(),
    _ = require('lodash');

module.exports = function(Courses) {

    return {
        /**
         * Find course by id
         */
        course: function(req, res, next, id) {
            Course.load(id, function(err, course) {
                if (err) return next(err);
                if (!course) return next(new Error('Failed to load course ' + id));
                req.course = course;
                next();
            });
        },
        /**
         * Create an course
         */
        create: function(req, res) {
            var course = new Course(req.body);
            course.user = req.user;

            course.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the course'
                    });
                }

                Courses.events.publish({
                    action: 'created',
                    user: {
                        name: req.user.name
                    },
                    url: config.hostname + '/courses/' + course._id,
                    name: course.title
                });

                res.json(course);
            });
        },
        /**
         * Update an course
         */
        update: function(req, res) {
            var course = req.course;

            course = _.extend(course, req.body);


            course.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the course'
                    });
                }

                Courses.events.publish({
                    action: 'updated',
                    user: {
                        name: req.user.name
                    },
                    name: course.title,
                    url: config.hostname + '/courses/' + course._id
                });

                res.json(course);
            });
        },
        /**
         * Delete an course
         */
        destroy: function(req, res) {
            var course = req.course;


            course.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the course'
                    });
                }

                Courses.events.publish({
                    action: 'deleted',
                    user: {
                        name: req.user.name
                    },
                    name: course.title
                });

                res.json(course);
            });
        },
        /**
         * Show a course
         */
        show: function(req, res) {

            Courses.events.publish({
                action: 'viewed',
                user: {
                    name: req.user.name
                },
                name: req.course.title,
                url: config.hostname + '/courses/' + req.course._id
            });

            res.json(req.course);
        },
        /**
         * List of Courses
         */
        all: function(req, res) {
           
            //query.find({}).sort('-created').populate('user', 'name username').exec(function(err, courses) {
            Course.find({}).sort('-created').populate('user', 'name username').exec(function(err, courses) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the courses'
                    });
                }

                res.json(courses)
            });

        },




        /**
         * Create a todo
         */
        addTodo: function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");   
            var _result = _course.todos;
            
            if(req.params.chapterId==0){
                _course.todos.unshift(req.body);                
                _course.save();
                _result = _course.todos[0];
            }
            else{
                var chapter = _course.chapters.id(req.params.chapterId);
                if(req.params.partId==0){
                    chapter.todos.unshift(req.body);
                    chapter.save();                    
                    _course.save();
                    _result = chapter.todos[0];
                    }
                    else{

                        var part = chapter.parts.id(req.params.partId);
                        if(req.params.facttId==0){
                            part.todos.unshift(req.body);
                            part.save();    
                            chapter.save();
                            _course.save();
                            _result = part.todos[0];
                        }
                        else{
                            var fact = part.facts.id(req.params.factId);
                            var todo = req.body;
                            todo.classof = fact.classof;
                            fact.todos.unshift(todo);
                            fact.save();    
                            part.save();    
                            chapter.save();
                            _course.save();
                            _result = part.todos[0];

                        }

                    }
            }           
            

            res.json(_result);
            })
        },
        // delete a todo from the course
        removeTodo:function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");   
            var _result = _course.todos;            
            if(req.params.chapterId==0){
                _course.todos.id(req.params.todoId).remove();               
                _course.save();
            }
            else{
                var chapter = _course.chapters.id(req.params.chapterId);
                if(req.params.partId==0){
                    chapter.todos.id(req.params.todoId).remove();               
                    chapter.save();                    
                    _course.save();
                    _result = chapter.todos;
                    }
                    else{
                        var part = chapter.parts.id(req.params.partId);
                        if(req.params.factId==0){                            
                            part.todos.id(req.params.todoId).remove(); 
                            part.save();    
                            chapter.save();
                            _course.save();
                            _result = part.todos;
                        }
                        else{
                            var fact = part.facts.id(req.params.partId);
                            fact.todos.id(req.params.todoId).remove(); 
                            fact.save();    
                            part.save();    
                            chapter.save();
                            _course.save();
                            _result = fact.todos;
                        }
                    }
                }
            res.json(_result);
            })
        },
  
        
        // delete a todo from the course
        removeCourseTodo:function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");   
            if(req.params.factId != 0){
                var _fact = _course.facts.id(req.params.factId)
                _fact.todos.id(req.params.todoId).remove();               
                _fact.save();
            }
            else 
                _course.todos.id(req.params.todoId).remove();               
            _course.save();
            res.json('ok');
            })
        },

         // delete a todo from a chapter
        removeChapterTodo:function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _chapter = _course.chapters.id(req.params.chapterId)           
            if(req.params.factId != 0){
                var _fact = _chapter.facts.id(req.params.factoId)
                _fact.todos.id(req.params.todoId).remove();               
                _fact.save();                
            }
            else 
                _chapter.todos.id(req.params.todoId).remove();               
            _chapter.save();
            _course.save();
            res.json('ok');
            })
        },
         // delete a todo from a part
        removePartTodo:function(req, res) {
       Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _chapter = _course.chapters.id(req.params.chapterId);           
            var _part = _chapter.parts.id(req.params.partId);
            if(req.params.factId != 0){
                var _fact = _part.facts.id(req.params.factoId)
                _fact.todos.id(req.params.todoId).remove();               
                _fact.save();
                
            }
            else 
                _part.todos.id(req.params.todoId).remove();               
            _part.save();
            _chapter.save();
            _course.save();
            res.json('ok');
            })
        },
        
        
                // edit a todo of  the course
        editCourseTodo:function(req, res) {        
            
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");   
            var _todo = 0;
            if(req.params.factId != 0){
                var _fact = _course.facts.id(req.params.factId)
                var _todo = _fact.todos.id(req.params.todoId);
                _todo.todo = req.body.todo;
                _todo.updated = req.body.updated;
                _todo.save();
                _fact.save();
            }
            else 
                {
                    var _todo = _course.todos.id(req.params.todoId);
                    _todo.todo = req.body.todo;
                    _todo.updated = req.body.updated;
                    _todo.save();
                }               
            _course.save();
            res.json(_todo);
            })
        },

         // edit a todo of  a chapter
        editChapterTodo:function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _todo = 0;
            var _chapter = _course.chapters.id(req.params.chapterId)           
            if(req.params.factId != 0){
                var _fact = _chapter.facts.id(req.params.factoId)
                _todo = _fact.todos.id(req.params.todoId);    
                _todo.todo = req.body.todo;
                _todo.save();           
                _fact.save();                
            }
            else 
                {
                    _todo = _chapter.todos.id(req.params.todoId);               
                    _todo.todo = req.body.todo;
                    _todo.save();

                }
            _chapter.save();
            _course.save();
            res.json(_todo);
            })
        },
         // edit a todo of  a part
        editPartTodo:function(req, res) {
       Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _todo = 0;
            var _chapter = _course.chapters.id(req.params.chapterId);           
            var _part = _chapter.parts.id(req.params.partId);
            if(req.params.factId != 0){
                var _fact = _part.facts.id(req.params.factoId)
                _todo = _fact.todos.id(req.params.todoId);               
                _todo.todo = req.body.todo;
                _todo.save();
                _fact.save();
                
            }
            else 
                {
                    _todo = _part.todos.id(req.params.todoId);
                    _todo.todo = req.body.todo;
                    _todo.save();
                }               
            _part.save();
            _chapter.save();
            _course.save();
            res.json(_todo);
            })
        },




    };
}
