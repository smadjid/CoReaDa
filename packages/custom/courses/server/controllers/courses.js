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

         /*   Courses.events.publish({
                action: 'viewed',
                user: {
                    name: req.user.name
                },
                name: req.course.title,
                url: config.hostname + '/courses/' + req.course._id
            });*/

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

                var result = [];
                for (var i = 0; i< courses.length; i++){              
                var course={
                    '_id':courses[i]._id,
                    'title':courses[i].title,
                    'created':courses[i].created
                }

               result.push(course);
            };


                res.json(result)
            });

        },




        /**
         * Create a todo
         */
        addTodo: function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");   
            var _result = _course.todos;
            
            if(req.params.tomeId==0){
                _course.todos.unshift(req.body);                
                _course.save();
                _result = _course.todos[0];
            }
            else{
                var tome = _course.tomes.id(req.params.tomeId);
                if(req.params.chapterId==0){
                    tome.todos.unshift(req.body);
                    tome.save();                    
                    _course.save();
                    _result = tome.todos[0];
                }
                else{
                    var chapter = tome.chapters.id(req.params.chapterId);
                    if(req.params.partId==0){
                        chapter.todos.unshift(req.body);
                        chapter.save();                    
                        tome.save();      
                        _course.save();
                        _result = chapter.todos[0];
                        }
                        else{

                            var part = chapter.parts.id(req.params.partId);
                            if(req.params.factId==0){
                                part.todos.unshift(req.body);
                                part.save();    
                                chapter.save();
                                tome.save();      
                                _course.save();
                                _result = part.todos[0];
                            }
                            else{
                                var fact = part.facts.id(req.params.factId);
                                var todo = req.body;
                                todo.classof = fact.classof;
                                todo.classof = fact.issueCode
                                fact.todos.unshift(todo);
                                fact.save();    
                                part.save();    
                                chapter.save();
                                tome.save();      
                                _course.save();
                                _result = fact.todos[0];

                            }

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
        removeTomeTodo:function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _tome = _course.tomes.id(req.params.tomeId)           
            if(req.params.factId != 0){
                var _fact = _tome.facts.id(req.params.factId)
                _fact.todos.id(req.params.todoId).remove();               
                _fact.save();                
            }
            else 
                _tome.todos.id(req.params.todoId).remove();               
            _tome.save();
            _course.save();
            res.json('ok');
            })
        },
         // delete a todo from a chapter
        removeChapterTodo:function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _tome = _course.tomes.id(req.params.tomeId)           
            var _chapter = _tome.chapters.id(req.params.chapterId)           
            if(req.params.factId != 0){
                var _fact = _chapter.facts.id(req.params.factId)
                _fact.todos.id(req.params.todoId).remove();               
                _fact.save();                
            }
            else 
                _chapter.todos.id(req.params.todoId).remove();               
            _chapter.save();
            _tome.save();
            _course.save();
            res.json('ok');
            })
        },
         // delete a todo from a part
        removePartTodo:function(req, res) {
       Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _tome = _course.chapters.id(req.params.chapterId);           
            var _chapter = _tome.chapters.id(req.params.chapterId); 
            var _part = _chapter.parts.id(req.params.partId);
            if(req.params.factId != 0){
                var _fact = _part.facts.id(req.params.factId)
                _fact.todos.id(req.params.todoId).remove();               
                _fact.save();
                
            }
            else 
                _part.todos.id(req.params.todoId).remove();               
            _part.save();
            _chapter.save();
            _tome.save();
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
        // edit a todo of  a tome
        editTomeTodo:function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _todo = 0;
            var _tome = _course.tomes.id(req.params.tomeId)           
            if(req.params.factId != 0){
                var _fact = _tome.facts.id(req.params.factId)
                _todo = _fact.todos.id(req.params.todoId);    
                _todo.todo = req.body.todo;
                _todo.save();           
                _fact.save();                
            }
            else 
                {
                    _todo = _tome.todos.id(req.params.todoId);               
                    _todo.todo = req.body.todo;
                    _todo.save();

                }
            _tome.save();
            _course.save();
            res.json(_todo);
            })
        },
         
         // edit a todo of  a chapter
        editChapterTodo:function(req, res) {
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _todo = 0;
            var _tome = _course.tomes.id(req.params.tomeId)           
            var _chapter = _tome.chapters.id(req.params.chapterId)           
            if(req.params.factId != 0){
                var _fact = _chapter.facts.id(req.params.factId)
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
            _tome.save();
            _course.save();
            res.json(_todo);
            })
        },
         // edit a todo of  a part
        editPartTodo:function(req, res) {
       Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _todo = 0;
            var _tome = _course.tomes.id(req.params.tomeId)           
            var _chapter = _tome.chapters.id(req.params.chapterId)
            var _part = _chapter.parts.id(req.params.partId);
            if(req.params.factId != 0){
                var _fact = _part.facts.id(req.params.factId)
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
            _tome.save();
            _course.save();
            res.json(_todo);
            })
        },
  ////////////////////////  
       seed: function(req, res){
        var fs = require("fs");
        var courseHome = "coursesdata/"+req.params.courseTitle;
        //var course = 
        
        var facts = fs.readFileSync(courseHome+"/facts.json");
        var jsonFacts = JSON.parse(facts);

        //var coursedata = fs.readFileSync("CourseStats.json");
      //  var jsonCoursedata = JSON.parse(coursedata);
        var partsdata = fs.readFileSync(courseHome+"/structure.json");
        var jsonPartsdata = JSON.parse(partsdata);

        var courseName=fs.readFileSync(courseHome+"/"+req.params.courseTitle);
        var jsoncourseName = JSON.parse(courseName);
        var course_title = jsoncourseName[0].title;
        console.log(course_title);



        //course
        var partsCount = 0;
        var tomesCount = 0;
       var courseParts=[];
       var courseChapters=[];
       var courseTomes=[];
        for(var key in jsonPartsdata) {
            partsCount = Math.max(partsCount, jsonPartsdata[key].id);
            tomesCount = Math.min(tomesCount, jsonPartsdata[key].id);

        }
         
       var subsetByField = function (arr,field,value) {
        var objectArray = [];
             for (var i = 0, l = arr.length; i < l; i++){
                
                    if (arr[i][field] === value) {
                     objectArray.push(arr[i]);
                }        
            }
            return objectArray;
        }

        var computePart = function(p, part_data, part_facts){            
        var part = {
                'id':part_data[0]['id'],
                'title':part_data[0]['part_title'],
                'elementType':part_data[0]['part_type'],
                'properties':[],
                'facts':[]
            };
            for (var i = 0, l = part_data.length; i < l; i++){
                var prop ={
                    property : part_data[i]['variable'],
                    value : part_data[i]['value']
                } 
                part.properties.push(prop);
                if(part_data[i]['variable']=='part_id') 
                    part.part_id=part_data[i]['value']
                else
                    if(part_data[i]['variable']=='part_title') 
                        part.title=part_data[i]['value']
                    else
                        if(part_data[i]['variable']=='part_type')
                            part.type=part_data[i]['value']
                        else
                            if(part_data[i]['variable']=='part_parent')
                                part.parent_id=part_data[i]['value']
                            else
                                part.properties.push(prop);
           
            };

            for (var i = 0, l = part_facts.length; i < l; i++){              
                var fact={
                    'name':part_facts[i].content,
                    'value':part_facts[i].value,
                    'classof':part_facts[i].classe,
                    'issueCode':part_facts[i].issueCode,
                    'type':part_facts[i].type,
                    'elementType':'fact',
                    'description':part_facts[i].description,
                    'norm_value':part_facts[i].norm_value,
                    'gravity':part_facts[i].gravity,
                    'suggestion_title': part_facts[i].suggestion_title,
                    'suggestion_content':part_facts[i].suggestion_content
                }

                part.facts.push(fact);
            };
        if(part.type==='tome') {
            var  tome={
                'id':part.id,
                'part_id':part.part_id,
                'title':part.title,
                'type':part.type,
                'elementType':'tome',
                'properties': part.properties,
                'facts':[],
                'chapters':[]
            };
            courseTomes.push(tome); 
            
        };
        if(part.type==='chapter') {
            var chapter={
                'id':part.id,
                'part_id':part.part_id,
                'parent_id':part.parent_id,
                'title':part.title,
                'type':part.type,
                'elementType':'chapter',
                'properties': part.properties,
                'facts':[],
                'parts':[]
            }
            part.parent_id=part.part_id;
            part.type='subchapter';
            part.title='Introduction';
            
            
            
            courseChapters.push(chapter);            

            courseParts.push(part);
        }
       else if(part.type==='subchapter') 
        courseParts.push(part);
       }
       

         
       for (var i = 1; i <=partsCount ; i++){ 

            var partProps = subsetByField(jsonPartsdata, 'id', i);
            var partFacts = subsetByField(jsonFacts, 'id', i);
 
            computePart(i, partProps, partFacts);
            
      
        };
        
        if(tomesCount<0)
        for (var i = -1; i >=tomesCount ; i--){ 

            var partProps = subsetByField(jsonPartsdata, 'id', i);
            computePart(i, partProps, []);
            
      
        };
        
        /*********** Chapters & Tomes ***************/
    
        for (var i = 0; i < courseParts.length ; i++){ 
                   var parent = courseParts[i]['parent_id'];
            
                   for(var j = 0; j < courseChapters.length; j++)
                    if(courseChapters[j].part_id==parent)
                        courseChapters[j].parts.push(courseParts[i]);
     
        };

console.log(courseChapters[1]);
        for (var i = 0; i < courseChapters.length ; i++){ 
                    var self = courseChapters[i]['id'];
                    var parent = courseChapters[i]['parent_id'];           
                
                
                for(var j = 0; j < courseTomes.length; j++)
                    if(courseTomes[j].part_id==parent)
                        courseTomes[j].chapters.push(courseChapters[i]);
        };

       


        /************ COURSE *****************/
        
        var course = new Course( {
            title : course_title,
            version : 1.0,
            parts:courseParts,
            properties:[],//jsonCoursedata,
            tomes:courseTomes,
            elementType:'course',
            content:'course content',
            user:"565d54d764d8ea197d1b6ccc",
            facts: [],  
            todos: []
        });

        
        
        course.save(function(err){
            if (err){
                console.log("erreur d'écriture: "+ err)
            }
            else{
                console.log("enregistrement effectué");
            }
        });
        
console.log("\n *FINISHED SEEDING* \n");
return res.status(200).json('Success : Course '+course_title+' seeded ');

       }
    };
}
