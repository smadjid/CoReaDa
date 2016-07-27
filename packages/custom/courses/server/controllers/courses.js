'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Course = mongoose.model('Course'),
    CoReaDa = mongoose.model('CoReaDa'),
    config = require('meanio').loadConfig(),
    _ = require('lodash'),
    nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport('smtps://coreada.project%40gmail.com:madjid1980@smtp.gmail.com');

module.exports = function(Courses) {
    var analyzeCourse = function(courseCode){
        var courseHome="coursesdata/"+courseCode;
    
    
    var fs = require("fs");      

        
        var facts = fs.readFileSync(courseHome+"/facts.json");
        var jsonFacts = JSON.parse(facts);

        var coursedata = fs.readFileSync(courseHome+"/stats.json");
        var coursestats = JSON.parse(coursedata);

        //var coursersdata = fs.readFileSync(courseHome+"/rs.json");
        //var coursers = JSON.parse(coursersdata);

        var partsdata = fs.readFileSync(courseHome+"/structure.json");
        var jsonPartsdata = JSON.parse(partsdata);

        //var course_title = jsoncourseName[0].title;
        



        //course
        var partsCount = 0;
        var tomesCount = 0;
       var courseParts=[];
       var courseChapters=[];
       var courseTomes=[];
       var courseData={};

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
                'parent_id':part_data[0]['parent_id'],
                'title':part_data[0]['title'],
                'elementType':part_data[0]['type'],
                'properties':[],
                'url':'',
                'facts':[],
                'actions':0.0,
                'nbactions':0,
                'reread':0.0,
                'stop':0.0,
                'speed':0
            };
            

            for (var i = 0, l = part_data.length; i < l; i++){
                var prop ={
                    property : part_data[i]['variable'],
                    value : part_data[i]['value']
                } 
                if(prop.property==='mean.duration') prop.value = parseInt(prop.value/60)
                part.properties.push(prop);
                if(part_data[i]['variable']=='part_id') 
                    part.part_id=part_data[i]['value']
                else
                    if(part_data[i]['variable']=='title') 
                        part.title=part_data[i]['value']
                    else
                        if(part_data[i]['variable']=='slug') 
                        part.url=part_data[i]['value']
                        else
                        if(part_data[i]['variable']=='type')
                            part.type=part_data[i]['value']
                        else
                            if(part_data[i]['variable']=='parent_id')
                                part.parent_id=part_data[i]['value']
                            else
                            if(part_data[i]['variable']=='speed')
                                part.speed=parseInt(part_data[i]['value'])
                            else
                            if(part_data[i]['variable']=='actions')
                                part.actions=parseFloat(part_data[i]['value'])
                            else
                            if(part_data[i]['variable']=='reread')
                                part.reread=parseFloat(part_data[i]['value'])
                            else
                            if(part_data[i]['variable']=='stop')
                                part.stop=parseFloat(part_data[i]['value'])
                             else
                            if(part_data[i]['variable']=='Actions_nb')
                                part.nbactions=parseInt(part_data[i]['value'])
            };

            for (var i = 0, l = part_facts.length; i < l; i++){              
                var fact={
                    'name':part_facts[i].content,
                    'value':part_facts[i].value,
                    'classof':part_facts[i].classe,
                    'issueCode':part_facts[i].classe,
                    'type':part_facts[i].type,
                    'elementType':'fact',
                    'description':part_facts[i].description,
                    'norm_value':part_facts[i].norm_value,
                    'delta':part_facts[i].delta,
                    'suggestion_title': part_facts[i].suggestion_title,
                    'suggestion_content':part_facts[i].suggestion_content
                }

                part.facts.push(fact);
            };
        if(part.type==='course') {           
            
            courseData.title = part.title;
            courseData.url = part.slug;
            courseData.properties = part.properties; 
            
        };
        if(part.type==='partie') {
            var tome = part;
            tome.elementType = 'partie';
            tome.chapters = []
            courseTomes.push(tome); 
            
        };
        if(part.type==='chapitre') {

            var chapter=part;
            chapter.elementType='chapitre';
            chapter.parts=[];
            
            courseChapters.push(chapter);            

           
        }
       else if(part.type==='section') 
        courseParts.push(part);



      
       }
       


       for (var i = 0; i <=partsCount ; i++){ 

            var partProps = subsetByField(jsonPartsdata, 'id', i);
            var partId = 0;

            for(var key in partProps) {
                    if(partProps[key].variable=='part_id') partId = partProps[key].value
                }
            
            var partFacts = [];
            for(var key in jsonFacts) {
                    if(jsonFacts[key].part_id==partId) partFacts.push(jsonFacts[key])
                }

          
            
 
            computePart(i, partProps, partFacts);
            
      
        };
        
     
        for (var i = -1; i >=tomesCount ; i--){ 

            var partProps = subsetByField(jsonPartsdata, 'id', i);

            var partId = 0;
            for(var key in partProps) {
                    if(partProps[key].variable=='part_id') partId = partProps[key].value
                }
            
            var partFacts = [];
            for(var key in jsonFacts) {
                    if(jsonFacts[key].part_id==partId) partFacts.push(jsonFacts[key])
                }

          
            computePart(i, partProps, partFacts);
            
      
        };
        
        /*********** Chapters & Tomes ***************/
    
        for (var i = 0; i < courseParts.length ; i++){ 
                   var parent = courseParts[i]['parent_id'];
            
                   for(var j = 0; j < courseChapters.length; j++)
                    if(courseChapters[j].part_id==parent)
                        courseChapters[j].parts.push(courseParts[i]);
     
        };



        for (var i = 0; i < courseChapters.length ; i++){ 
                    var self = courseChapters[i]['id'];
                    var parent = courseChapters[i]['parent_id'];           
                
                
                for(var j = 0; j < courseTomes.length; j++)
                    if(courseTomes[j].part_id==parent)
                        courseTomes[j].chapters.push(courseChapters[i]);
        };


       


        /************ COURSE *****************/

        var sectionsAvailable = false;
        var sectionsAvailableData = subsetByField(coursestats,'property','sectionsAvailable');
        
        
        if(sectionsAvailableData.length>0) sectionsAvailable = sectionsAvailableData[0].value
        var course = new Course( {
            title : courseData.title,
            url:courseData.url,
            version : 1.0,
            courseCode:courseCode,
            ob_begin:subsetByField(coursestats,'property','ob_begin')[0].value ,
            ob_end:subsetByField(coursestats,'property','ob_end')[0].value ,
            sectionsAvailable: sectionsAvailable,
            nbtasks : 0,
            nbfacts : jsonFacts.length,
            parts:courseParts,
            properties:courseData.properties,//jsonCoursedata,
            stats:coursestats,
          //  rs:coursers,
            tomes:courseTomes,
            elementType:'course',
            content:'course content',
            user:"565d54d764d8ea197d1b6ccc",
            facts: [],  
            todos: [],
            logs:[]
        });

        course.save(function(err){
            if (err){
                console.log("erreur d'écriture: "+ err)
            }
            else{
                console.log("enregistrement effectué");
            }
        });
        
console.log("\n *FINISHED SEEDING* "+courseData.title+" \n");


}


    return {        
        /**
         * Find course by id
         */
        course: function(req, res, next, id) {
            Course.load(id, function(err, course) {
                if (err) return next(err);
                if (!course) return next(new Error('Failed to load course ' + id));                
                course.logs.unshift({'name':'load'});                           
                req.course = course;   
                req.course.save();          
                next();
            });
        },

        /**
         * Show a course
         */
        feedback: function(req, res) {
           
            // setup e-mail data with unicode symbols
     
var mailOptions = {
    from:req.body.feedback.inputName + ' &lt; ' + req.body.feedback.inputEmail + ' &gt; ', 
    to: 'coreada.project@gmail.com', // list of receivers
    subject: 'COREADA : '+req.body.feedback.inputSubject,
    text:req.body.feedback.inputName + ' &lt;' + req.body.feedback.inputEmail + ' &gt; ' + req.body.feedback.inputMessage,
    html: req.body.feedback.inputName + ' &lt;' + req.body.feedback.inputEmail + ' &gt; '+ req.body.feedback.inputMessage
};





// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return res.status(501).type('application/json').json({error:'Error: ' + error});
    }
    return res.status(200).type('application/json').json({message:'Message envoyé. Merci! ' /*+ info.response*/});
});


        },
        
       
        /**
         * Show a course
         */
        show: function(req, res) {
            CoReaDa.findOne({}).exec(function(err, _coreada){
                       _coreada.logs.unshift({'name':'show course',
                        'params':[
                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                            {'paramName':'title','paramValue':req.course.title},
                            {'paramName':'course_id','paramValue':req.course._id}                            
                            ]}); 
                       _coreada.save();
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

                var result = [];
                for (var i = 0; i< courses.length; i++){   
                 
                var course={
                    '_id':courses[i]._id,
                    'title':courses[i].title,
                    'nbfacts':courses[i].nbfacts,
                    'ob_begin':courses[i].ob_begin,
                    'ob_end':courses[i].ob_end,
                    'nbtasks':courses[i].nbtasks,
                    'created':courses[i].created,
                    'updated':courses[i].updated
                }
               result.push(course);
            };


                res.json(result)
            });

        },
        /**
         * find a course
         */        
        find: function(req, res) {
            // coreada.logs.unshift({'name':'find course','elementId':req.params.courseCode,'params':[{'paramName':'ip','paramValue':req.connection.remoteAddress}]}); 
            CoReaDa.findOne({}).exec(function(err, _coreada){
                       _coreada.logs.unshift({'name':'find course',
                        'params':[
                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                            {'paramName':'code','paramValue':req.params.courseCode}
                            ]}); 
                       _coreada.save();
            });

            if(req.params.courseCode=="coreadas")
               {
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
                    'nbfacts':courses[i].nbfacts,
                    'ob_begin':new Date(Date.parse(courses[i].ob_begin)),
                    'ob_end':new Date(Date.parse(courses[i].ob_end)),
                    'nbtasks':courses[i].nbtasks,
                    'created':courses[i].created,
                    'updated':courses[i].updated
                }
               result.push(course);
            };


               return res.json(result)
            });
        }
        else{

            Course.findOne({}).where("courseCode").equals(req.params.courseCode).exec(function(err, _course){
                if (err) {
                    return res.status(500).json({
                        error: 'Course not found'
                    });
                }
                if (_course==null) {
                    return res.status(404).json({
                        error: 'Course not found'
                    });
                }
            //res.json(req.course);
                console.log(_course.title)
                var result = [];
                var course={
                    '_id':_course._id,
                    'title':_course.title,
                    'nbfacts':_course.nbfacts,
                    'ob_begin':new Date(Date.parse(_course.ob_begin)),
                    'ob_end':new Date(Date.parse(_course.ob_end)),
                    'nbtasks':_course.nbtasks,
                    'created':_course.created,
                    'updated':_course.updated
                }
                result.push(course);
                return res.status(200).json(result);
                })
            }
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
                _course.logs.unshift({'name':'addTodo','elementId':req.params.courseId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_course.todos[0]._id}, 
                                    {'paramName':'content','paramValue':_course.todos[0].todo}
                                ] });               
                _course.nbtasks = _course.nbtasks + 1;
                _course.update=Date.now();
                _course.save();
                _result = _course.todos[0];
                console.log('course todo added');
            }
            else{
                var tome = _course.tomes.id(req.params.tomeId);
                if(req.params.chapterId==0){
                    tome.todos.unshift(req.body);
                    tome.save();                    
                   _course.logs.unshift({'name':'addTodo','elementId':req.params.tomeId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':tome.todos[0]._id}, 
                                    {'paramName':'content','paramValue':tome.todos[0].todo}
                                ] }); 
                    _course.nbtasks = _course.nbtasks + 1; 
                    _course.update=Date.now();
                    _course.save();
                    _result = tome.todos[0];
                    console.log('tome todo added');

                
                

                }
                else{
                    var chapter = tome.chapters.id(req.params.chapterId);
                    if(req.params.partId==0){
                        if(req.params.factId==0){
                            chapter.todos.unshift(req.body);
                            chapter.save();                    
                            tome.save();   
                            _course.logs.unshift({'name':'addTodo','elementId':req.params.chapterId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':chapter.todos[0]._id}, 
                                    {'paramName':'content','paramValue':chapter.todos[0].todo}
                                ] });   
                            _course.nbtasks = _course.nbtasks + 1; 
                            _course.update=Date.now();
                            _course.save();
                            _result = chapter.todos[0];
                            console.log('chapter todo added');
                        }
                        else{
                            var fact = chapter.facts.id(req.params.factId);
                            var todo = req.body;
                            todo.classof = fact.classof;
                            todo.issueCode = fact.classof;
                            fact.todos.unshift(todo);
                            fact.save();   
                            chapter.save();                    
                            tome.save();    
                            _course.logs.unshift({'name':'addTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':fact.todos[0]._id}, 
                                    {'paramName':'content','paramValue':fact.todos[0].todo},
                                    {'paramName':'parentId','paramValue':chapter._id}
                                ] });   
                            _course.nbtasks = _course.nbtasks + 1;
                            _course.update=Date.now();
                            _course.save();
                            _result = fact.todos[0];
                            console.log('chapter FACT todo added');

                        }

                    }
                        else{

                            var part = chapter.parts.id(req.params.partId);
                            if(req.params.factId==0){
                                part.todos.unshift(req.body);
                                part.save();    
                                chapter.save();
                                tome.save();   
                                _course.logs.unshift({'name':'addTodo','elementId':req.params.parttId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':part.todos[0]._id}, 
                                    {'paramName':'content','paramValue':part.todos[0].todo}
                                ] }); 
                                _course.nbtasks = _course.nbtasks + 1;   
                                _course.update=Date.now();
                                _course.save();
                                _result = part.todos[0];
                                console.log('part todo added');
                            }
                            else{
                                var fact = part.facts.id(req.params.factId);
                                var todo = req.body;
                                todo.classof = fact.classof;
                                todo.issueCode = fact.issueCode
                                fact.todos.unshift(todo);
                                fact.save();    
                                part.save();    
                                chapter.save();
                                tome.save();    
                                _course.logs.unshift({'name':'addTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':fact.todos[0]._id}, 
                                    {'paramName':'content','paramValue':fact.todos[0].todo},
                                    {'paramName':'parentId','paramValue':part._id}
                                ] });   
                                _course.nbtasks = _course.nbtasks + 1;
                                _course.update=Date.now();
                                _course.save();
                                _result = fact.todos[0];
                                console.log('part FACT todo added');

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
                var _fact = _course.facts.id(req.params.factId);
                var _todo = _fact.todos.id(req.params.todoId);                
                _course.logs.unshift({'name':'removeTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_course._id}
                                ] });

                _fact.todos.id(req.params.todoId).remove();               
                _fact.save();
            }
            else 
                {
                    var _todo = _course.todos.id(req.params.todoId);
                    _course.logs.unshift({'name':'removeTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'content','paramValue':_todo.todo}
                                ] });
                    _course.todos.id(req.params.todoId).remove(); 
                }              
            _course.nbtasks = _course.nbtasks - 1;
            _course.update=Date.now();
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
                var _fact = _tome.facts.id(req.params.factId);
                 var _todo = _fact.todos.id(req.params.todoId);                
                _course.logs.unshift({'name':'removeTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_tome._id}
                                ] });
                _fact.todos.id(req.params.todoId).remove();               
                _fact.save();                
            }
            else 
                {
                     var _todo = _tome.todos.id(req.params.todoId);                
                    _course.logs.unshift({'name':'removeTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_course._id}
                                ] });
                    _tome.todos.id(req.params.todoId).remove();     
                }          
            _tome.save();
            _course.nbtasks = _course.nbtasks - 1;
            _course.update=Date.now();
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
                var _fact = _chapter.facts.id(req.params.factId);
                 var _todo = _fact.todos.id(req.params.todoId);                
                _course.logs.unshift({'name':'removeTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_chapter._id}
                                ] });
                _fact.todos.id(req.params.todoId).remove();               
                _fact.save();                
            }
            else 
                {
                     var _todo = _chapter.todos.id(req.params.todoId);                
                    _course.logs.unshift({'name':'removeTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_chapter._id}
                                ] });
                    _chapter.todos.id(req.params.todoId).remove();
                }               
            _chapter.save();
            _tome.save();
            _course.nbtasks = _course.nbtasks - 1;
            _course.update=Date.now();
            _course.save();
            res.json('ok');
            })
        },
         // delete a todo from a part
        removePartTodo:function(req, res) {
       Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error finding the course.");    
            var _tome = _course.tomes.id(req.params.tomeId);           
            var _chapter = _tome.chapters.id(req.params.chapterId); 
            var _part = _chapter.parts.id(req.params.partId);
            if(req.params.factId != 0){
                var _fact = _part.facts.id(req.params.factId);
                 var _todo = _fact.todos.id(req.params.todoId);                
                _course.logs.unshift({'name':'removeTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_part._id}
                                ] });
                _fact.todos.id(req.params.todoId).remove();               
                _fact.save();
                
            }
            else 
                {
                     var _todo = _fact.todos.id(req.params.todoId);                
                    _course.logs.unshift({'name':'removeTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_part._id}
                                ] });
                    _part.todos.id(req.params.todoId).remove();
                }               
            _part.save();
            _chapter.save();
            _tome.save();
            _course.nbtasks = _course.nbtasks - 1;
            _course.update=Date.now();
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
                var old = _todo.todo;
                _todo.todo = req.body.todo;
                _todo.updated = req.body.updated;
                _todo.save();
                _fact.save();
                 _course.logs.unshift({'name':'editTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'oldcontent','paramValue':old},
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_course._id}
                                ] });
            }
            else 
                {
                    var _todo = _course.todos.id(req.params.todoId);
                    var old = _todo.todo;
                    _todo.todo = req.body.todo;
                    _todo.done = req.body.done;
                    _todo.updated = req.body.updated;
                    _todo.save();
                    _course.logs.unshift({'name':'editTodo','elementId':req.params.courseId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'oldcontent','paramValue':old},
                                    {'paramName':'content','paramValue':_todo.todo}
                                ] });
                }               
            _course.update=Date.now();
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
                var old = _todo.todo;
                _todo.todo = req.body.todo;
                _todo.done = req.body.done;
                _todo.save();           
                _fact.save();  
                _course.logs.unshift({'name':'editTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'oldcontent','paramValue':old},
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_tome._id}
                                ] });              
            }
            else 
                {
                    _todo = _tome.todos.id(req.params.todoId); 
                    var old = _todo.todo;              
                    _todo.todo = req.body.todo;
                    _todo.save();
                    _course.logs.unshift({'name':'editTodo','elementId':req.params.tomeId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'oldcontent','paramValue':old},
                                    {'paramName':'content','paramValue':_todo.todo}
                                ] }); 

                }
            _tome.save();
            _course.update=Date.now();
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
                var old = _todo.todo; 
                _todo.todo = req.body.todo;
                _todo.done = req.body.done;
                _todo.save();           
                _fact.save();     
                _course.logs.unshift({'name':'editTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'oldcontent','paramValue':old},
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_chapter._id}
                                ] });            
            }
            else 
                {
                    _todo = _chapter.todos.id(req.params.todoId);     
                    var old = _todo.todo;          
                    _todo.todo = req.body.todo;
                    _todo.done = req.body.done;
                    _todo.save();
                    _course.logs.unshift({'name':'editTodo','elementId':req.params.chapterId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'oldcontent','paramValue':old},
                                    {'paramName':'content','paramValue':_todo.todo}
                                ] }); 

                }
            _chapter.save();
            _tome.save();
            _course.update=Date.now();
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
                var old = _todo.todo;         
                _todo.todo = req.body.todo;
                _todo.done = req.body.done;
                _todo.save();
                _fact.save();
                _course.logs.unshift({'name':'editTodo','elementId':req.params.factId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'oldcontent','paramValue':old},
                                    {'paramName':'content','paramValue':_todo.todo},
                                    {'paramName':'parentId','paramValue':_part._id}
                                ] }); 
                
            }
            else 
                {
                    _todo = _part.todos.id(req.params.todoId);
                    var old = _todo.todo;
                    _todo.todo = req.body.todo;
                    _todo.done = req.body.done;
                    _todo.save();
                    _course.logs.unshift({'name':'editTodo','elementId':req.params.partId,
                                'params':[
                                    {'paramName':'ip','paramValue':req.connection.remoteAddress}, 
                                    {'paramName':'todoId','paramValue':_todo._id}, 
                                    {'paramName':'oldcontent','paramValue':old},
                                    {'paramName':'content','paramValue':_todo.todo}
                                ] }); 
                }               
            _part.save();
            _chapter.save();
            _tome.save();
            _course.update=Date.now();
            _course.save();
            res.json(_todo);
            })
        },
        /**
         * Create a todo
         */
        addLog: function(req, res) {
            
        Course.findOne({}).where("_id").equals(req.params.courseId).exec(function(err, _course){
            if(err) return next("Error saving the log.");   
            var _result = _course.logs;
             _course.logs.unshift(req.body); 
             _course.update=Date.now();
            _course.save();
            
            return res.status(200).json('Success - Log saved: '+_course.logs[0]);
            
            })
        },
  ////////////////////////  
       seedall: function(req, res){

        var fs = require("fs");
         var allF = fs.readdirSync("coursesdata/");

       
        for (var i = 0; i < allF.length ; i++){
             console.log('Cours ',i,'/',allF.length,' : ',allF[i]);            
            analyzeCourse(allF[i]);

        }
        return res.status(200).json('Tous les cours ont été chargés en base de données');
    },
    seed: function(req, res){
        
        var fs = require("fs");
        console.log('Cours : '+req.params.courseTitle);
        analyzeCourse(req.params.courseTitle);
console.log("\n *FINISHED SEEDING* \n");
return res.status(200).json('Success : Course '+req.params.courseTitle+' seeded ');

       },
     ////////////////////////  
       seedcoreada: function(req, res){
       var coreada = new CoReaDa( {            
            logs:[]
        });

        coreada.save(function(err){
            if (err){
                console.log("erreur d'écriture: "+ err)
            }
            else{
                console.log("CoReaDa log init DONE");
            }
        });
        return res.status(200).json('CoReaDa log init DONE');
    },
    coreadalog: function(req, res){
        CoReaDa.findOne({}).exec(function(err, _coreada){
            _coreada.logs.unshift({'name':'coreada access',
                        'params':[
                            {'paramName':'ip','paramValue':req.connection.remoteAddress}
                            ]}); 
            _coreada.save();; 

        
       
    });
         return res.status(200).json('log saved');
    },
     sendaccesslogs: function(req, res){
        var logs=[];
        CoReaDa.findOne({}).exec(function(err, _coreada){
            _coreada.logs.unshift({'name':'coreada access',
                        'params':[
                            {'paramName':'ip','paramValue':req.connection.remoteAddress}
                            ]}); 
            _coreada.save();

            logs = _coreada.logs;

            

         return res.status(200).json(logs);
       
    });

    }
    };
}
