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

        old_seed: function(req, res) {
        var fs = require("fs");
        //var course = 
        
        var facts = fs.readFileSync("facts.json");
        var jsonContent = JSON.parse(facts);

        var coursedata = fs.readFileSync("CourseStats.json");
        var jsonCoursedata = JSON.parse(coursedata);
       // jsonContent = JSON.stringify(jsonContent);



        //course
        var partCount = 0;
       var courseParts=[];
        for(var key in jsonContent) 
            {partCount = Math.max(partCount, jsonContent[key].id)}
      
       var initiatePart= function(p){
        var part = {
                'id':p,
                'title':'part',
                'facts':[]
            }
        courseParts.push(part);
       }
       

        var searchByKey = function (arr,field,value) {
             for (var i = 0, l = arr.length; i < l; i++){
                
                    if (arr[i][field] === value) {
                    return i;
                }        
            }
            return false;
        }
        for (var i = 1; i <=partCount ; i++) initiatePart(i);
            
        for(var key in jsonContent) {
            

            var idf = searchByKey(courseParts,'id',jsonContent[key].id);
            
            
            
                
                courseParts[idf]['title']=jsonContent[key].part_title;
               
                var fact={
                    'name':jsonContent[key].content,
                    'classof':jsonContent[key].classe,
                    'type':jsonContent[key].type
                }
                courseParts[idf].facts.push(fact);
                
            



        }
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
         console.log(jsonCoursedata[0]);
console.log("\n *FINISH* \n");

       },

  ////////////////////////  FOR TEST
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
                console.log(part_data[i]);
            };
            for (var i = 0, l = part_facts.length; i < l; i++){              
                var fact={
                    'name':part_facts[i].content,
                    'classof':part_facts[i].classe,
                    'type':part_facts[i].type
                }

                part.facts.push(fact);
            };

        courseParts.push(part);
       }
       

        
       for (var i = 1; i <=partCount ; i++){ 
            var partProps = subsetByField(jsonPartsdata, 'id', 10);
            var partFacts = subsetByField(jsonFacts, 'id', 10);
            computePart(10, partProps, partFacts);
            
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
        populatedb: function(req, res) {
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