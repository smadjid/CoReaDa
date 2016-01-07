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
        		_course.todos.unshift(req.body);
        		_course.save();
        	}
        	else{
        		var part = _course.parts.id(req.params.partId);
        		part.todos.unshift(req.body);
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
        
        	if(req.params.partId==0){
               var todo =  _course.todos.id(req.params.todoId);
               todo.todo = req.body.todo;
               todo.save();
        	}
        	else{
        		var part = _course.parts.id(req.params.partId);
                var todo =  part.todos.id(req.params.todoId);
        		part.todos.unshift(req.body);
        		todo.todo = req.body.todo;
        		todo.save();
        	}
        	
        	_course.save();
            res.json(_course);
        	})
        },
        // delete a todo
        removeTodo:function(req, res) {
          Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");  
            if(req.params.partId==0){
               _course.todos.id(req.params.todoId).remove();
            }
            else{
                var part = _course.parts.id(req.params.partId);
                part.todos.id(req.params.todoId).remove();
                part.save();
            }
            
            _course.save();
            res.json(_course);
            })

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

        old_seed: function(req, res) {
        var fs = require("fs");
        //var course = 
        
        var facts = fs.readFileSync("facts.json");
        var jsonFacts = JSON.parse(facts);

        var coursedata = fs.readFileSync("CourseStats.json");
        var jsonCoursedata = JSON.parse(coursedata);
        var partsdata = fs.readFileSync("PartsData.json");
        var jsonPartsdata = JSON.parse(partsdata);



        //course
        var partCount = 0;
       var courseParts=[];
        for(var key in jsonPartsdata) 
            {partCount = Math.max(partCount, jsonPartsdata[key].id)}
         
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
                'properties':[],
                'facts':[]
            };
            for (var i = 0, l = part_data.length; i < l; i++){
                var prop ={
                    property : part_data[i]['variable'],
                    value : part_data[i]['value']
                } 
                part.properties.push(prop);
            };
            for (var i = 0, l = part_facts.length; i < l; i++){              
                var fact={
                    'name':part_facts[i].content,
                    'value':part_facts[i].value,
                    'classof':part_facts[i].classe,
                    'type':part_facts[i].type,
                    'norm_description':part_facts[i].norm_description,
                    'norm_value':part_facts[i].norm_value
                }

                part.facts.push(fact);
            };

        courseParts.push(part);
       }
       

        
       for (var i = 1; i <=partCount ; i++){ 
            var partProps = subsetByField(jsonPartsdata, 'id', i);
            var partFacts = subsetByField(jsonFacts, 'id', i);
            computePart(i, partProps, partFacts);
            
       //     partProp = subsetByField()

            //initiatePart(i)


        };
           
        
        var course = new Course( {
            title : "Des applications ultra-rapides avec Node.js",
            version : 1.0,
            parts:courseParts,
            properties:jsonCoursedata,
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
        
console.log("\n *FINISH* \n");

       },

  ////////////////////////  
       seed: function(req, res) {
        var fs = require("fs");
        //var course = 
        
        var facts = fs.readFileSync("facts.json");
        var jsonFacts = JSON.parse(facts);

        var coursedata = fs.readFileSync("CourseStats.json");
        var jsonCoursedata = JSON.parse(coursedata);
        var partsdata = fs.readFileSync("PartsData.json");
        var jsonPartsdata = JSON.parse(partsdata);



        //course
        var partCount = 0;
       var courseParts=[];
       var courseChapters=[];
        for(var key in jsonPartsdata) 
            {partCount = Math.max(partCount, jsonPartsdata[key].id)}
         
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
                    'type':part_facts[i].type,
                    'description':part_facts[i].description,
                    'norm_value':part_facts[i].norm_value,
                    'gravity':part_facts[i].gravity
                }

                part.facts.push(fact);
            };
        if(part.type==='chapter') {
            var chapter={
                'id':part.id,
                'part_id':part.part_id,
                'title':part.title,
                'type':part.type,
                'properties': part.properties,
                'facts':part.facts,
                'parts':[]
            }
            courseChapters.push(chapter)
        }
       if(part.type==='subchapter') 
        courseParts.push(part);
       }
       

        
       for (var i = 1; i <=partCount ; i++){ 
            var partProps = subsetByField(jsonPartsdata, 'id', i);
            var partFacts = subsetByField(jsonFacts, 'id', i);
            computePart(i, partProps, partFacts);
      
        };
        
        /*********** Chapters ***************/
    
        for (var i = 0; i < courseParts.length ; i++){ 
                if(courseParts[i].type==='chapter'){ 
                    var self = courseParts[i]['id'];
            
                   for(var j = 0; j < courseChapters.length; j++)
                    if(courseChapters[j].id==self)
                        courseChapters[j].parts.push(courseParts[i]);

                }
                if(courseParts[i].type==='subchapter'){                   
                   var parent = courseParts[i]['parent_id'];
            
                   for(var j = 0; j < courseChapters.length; j++)
                    if(courseChapters[j].part_id==parent)
                        courseChapters[j].parts.push(courseParts[i]);
                }
        };


        /************ COURSE *****************/
        
        var course = new Course( {
            title : "Des applications ultra-rapides avec Node.js",
            version : 1.0,
            parts:courseParts,
            properties:jsonCoursedata,
            chapters:courseChapters,
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
        
console.log("\n *FINISH* \n");

       }
    };
}