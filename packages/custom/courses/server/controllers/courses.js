'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Course = mongoose.model('NewCourse'),
    CoReaDa = mongoose.model('CoReaDa'),
    config = require('meanio').loadConfig(),
    _ = require('lodash'),
    nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport('smtps://coreada.project%40gmail.com:madjid1980@smtp.gmail.com');

module.exports = function(Courses) {
    var base_url = "https://openclassrooms.com/courses";
    var analyzeCourse = function(courseCode){
        var courseHome="coursesdata/"+courseCode;
    
    
    var fs = require("fs");      

        
        var facts = fs.readFileSync(courseHome+"/facts.json");
        var jsonFacts = JSON.parse(facts);

        //var coursedata = fs.readFileSync(courseHome+"/stats.json");
        //var coursestats = JSON.parse(coursedata);

        var coursenavigation = fs.readFileSync(courseHome+"/navigation.json");
        var navigation = JSON.parse(coursenavigation);

        var partsdata = fs.readFileSync(courseHome+"/data.json");
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
                'indicators':{}
            
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
                        {part.slug=part_data[i]['value'];part.url=part_data[i]['value'];}
                        else
                        if(part_data[i]['variable']=='type')
                            part.type=part_data[i]['value']
                        else
                            if(part_data[i]['variable']=='parent_id')
                                part.parent_id=part_data[i]['value']
                            else
                            if(part_data[i]['variable']=='speed')
                                part.indicators.speed=parseInt(part_data[i]['value'])
                            else
                                if(part_data[i]['variable']=='Readers') 
                                    part.indicators.Readers=part_data[i]['value']
                                else
                                    if(part_data[i]['variable']=='destination_next') 
                                        part.indicators.destination_next=part_data[i]['value']
                                    else
                                         if(part_data[i]['variable']=='provenance_prev') 
                                            part.indicators.provenance_prev=part_data[i]['value']
                                        else
                            if(part_data[i]['variable']=='interest')
                                part.indicators.interest=parseFloat(part_data[i]['value'])
                            else
                            if(part_data[i]['variable']=='Actions_tx')
                                part.indicators.Actions_tx=parseFloat(part_data[i]['value'])
                            else
                            if(part_data[i]['variable']=='readers_tx')
                                part.indicators.readers_tx=parseFloat(part_data[i]['value'])
                            else
                            if(part_data[i]['variable']=='rs_tx')
                                part.indicators.rs_tx=parseFloat(part_data[i]['value'])
                            else
                            if(part_data[i]['variable']=='rereads_tx')
                                part.indicators.rereads_tx=parseFloat(part_data[i]['value'])
                            else
                            if(part_data[i]['variable']=='norecovery_tx')
                                part.indicators.norecovery_tx=parseFloat(part_data[i]['value'])
                            else
                                if(part_data[i]['variable']=='resume_past')
                                    part.indicators.resume_past=parseFloat(part_data[i]['value'])                            
                                else
                                if(part_data[i]['variable']=='resume_abnormal_tx')
                                    part.indicators.resume_abnormal_tx=parseFloat(part_data[i]['value'])
                             else
                                if(part_data[i]['variable']=='resume_future')
                                    part.indicators.resume_future=parseFloat(part_data[i]['value'])                            
                             else
                            if(part_data[i]['variable']=='Actions_nb')
                                part.indicators.nbactions=parseInt(part_data[i]['value'])
                            else
                                if(part_data[i]['variable']=='rereads_seq_tx')
                                    part.indicators.rereads_seq_tx=parseFloat(part_data[i]['value'])
                                 else
                                if(part_data[i]['variable']=='rereads_seq_globratio')
                                    part.indicators.rereads_seq_globratio=parseFloat(part_data[i]['value'])
                                else
                                if(part_data[i]['variable']=='rereads_dec_tx')
                                    part.indicators.rereads_dec_tx=parseFloat(part_data[i]['value'])
                                else
                                    if(part_data[i]['variable']=='rereads_dec_globaratio')
                                        part.indicators.rereads_dec_globaratio=parseFloat(part_data[i]['value'])
                                    else
                                    if(part_data[i]['variable']=='rupture_tx')
                                        part.indicators.rupture_tx=parseFloat(part_data[i]['value'])
                                    else 
                                        
                                        if(part_data[i]['variable']=='provenance_past')
                                            part.indicators.provenance_past=parseFloat(part_data[i]['value'])                                
                                        else 
                                        if(part_data[i]['variable']=='provenance_future')
                                            part.indicators.provenance_future=parseFloat(part_data[i]['value'])                                
                                        else
                                            
                                            if(part_data[i]['variable']=='destination_past')
                                                part.indicators.destination_past=parseFloat(part_data[i]['value'])                                
                                            else
                                            if(part_data[i]['variable']=='destination_future')
                                                part.indicators.destination_future=parseFloat(part_data[i]['value'])                                
                                            else
                                            if(part_data[i]['variable']=='destination_not_linear')
                                                part.indicators.destination_not_linear=parseFloat(part_data[i]['value'])                                
                                            else
                                            if(part_data[i]['variable']=='provenance_not_linear')
                                                part.indicators.provenance_not_linear=parseFloat(part_data[i]['value'])                                
                                            else
                                                if(part_data[i]['variable']=='reading_not_linear')
                                                part.indicators.reading_not_linear=parseFloat(part_data[i]['value'])                                
                                            else
                                            if(part_data[i]['variable']=='tome_index')
                                                part.tome_index=parseInt(part_data[i]['value'])   
                                            else
                                                 if(part_data[i]['variable']=='nactions') 
                                                    part.nactions=part_data[i]['value']
                                                else
                                                    if(part_data[i]['variable']=='nusers') 
                                                        part.nusers=part_data[i]['value']
                                                    else
                                                        if(part_data[i]['variable']=='nRS') 
                                                            part.nRS=part_data[i]['value']
                                                        else
                                                            if(part_data[i]['variable']=='ob_begin')
                                                                part.ob_begin=part_data[i]['value']
                                                            else
                                                                if(part_data[i]['variable']=='ob_end')
                                                                    part.ob_end=part_data[i]['value']

                            
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
            courseData.url = base_url+'/'+part.slug;
            courseData.properties = part.properties; 
            courseData.nactions = part.nactions;
            courseData.nusers = part.nusers;
            courseData.nRS = part.nRS;
            courseData.ob_begin = part.ob_begin;
            courseData.ob_end = part.ob_end;
            courseData.reading_not_linear = part.indicators.reading_not_linear;
            courseData.provenance_not_linear = part.indicators.provenance_not_linear;
            courseData.provenance_past = part.indicators.provenance_past ;
            courseData.provenance_prev = part.indicators.provenance_prev;
            courseData.provenance_future = part.indicators.provenance_future;
            courseData.destination_next = part.indicators.destination_next;
            courseData.destination_not_linear = part.indicators.destination_not_linear;
            courseData.destination_past = part.indicators.destination_past;
            courseData.destination_future = part.indicators.destination_future;    
            courseData.rereads_tx  = part.indicators.rereads_tx;
            courseData.rereads_seq_tx = part.indicators.rereads_seq_tx;
            courseData.rereads_seq_globratio = part.indicators.rereads_seq_globratio;
            courseData.rereads_dec_tx = part.indicators.rereads_dec_tx;
            courseData.rereads_dec_globratio = part.indicators.rereads_dec_globratio ;
            courseData.norecovery_tx = part.indicators.norecovery_tx;
            courseData.resume_abnormal_tx = part.indicators.resume_abnormal_tx;
            courseData.resume_past = part.indicators.resume_past;
            courseData.resume_future = part.indicators.resume_future;
            courseData.rupture_tx = part.indicators.rupture_tx;
            
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


       
 courseTomes.sort(function(a, b){return a.tome_index-b.tome_index}); 
 

        /************ COURSE *****************/

        var sectionsAvailable = false;
        //var sectionsAvailableData = subsetByField(coursestats,'property','sectionsAvailable');        
        
        //if(sectionsAvailableData.length>0) 
          //  sectionsAvailable = sectionsAvailableData[0].value;

        var cIndicators = {
            nactions : courseData.nactions,
            nusers : courseData.nusers,
            nRS : courseData.nRS,
            provenance_not_linear : courseData.provenance_not_linear ,
            provenance_past  : courseData.provenance_past ,
            provenance_prev : courseData.provenance_prev ,
            provenance_future : courseData.provenance_future ,
            destination_next : courseData.destination_next ,
            destination_not_linear : courseData.destination_not_linear ,
            reading_not_linear : courseData.reading_not_linear ,
            destination_past : courseData.destination_past ,
            destination_future : courseData.destination_future,
            rereads_tx  : courseData.rereads_tx,
            rereads_seq_tx : courseData.rereads_seq_tx,
            rereads_seq_globratio : courseData.rereads_seq_globratio,
            rereads_dec_tx : courseData.rereads_dec_tx,
            rereads_dec_globratio : courseData.rereads_dec_globratio,
            norecovery_tx : courseData.norecovery_tx,
            resume_abnormal_tx : courseData.resume_abnormal_tx,
            resume_past : courseData.resume_past,
            resume_future : courseData.resume_future,
            rupture_tx  : courseData.rupture_tx
        };
        console.log(cIndicators);
        var course = new Course( {
            title : courseData.title,
            url:courseData.url,
            version : 1.0,
            courseCode:courseCode,            
            ob_begin:courseData.ob_begin,
            ob_end:courseData.ob_end,
            sectionsAvailable: sectionsAvailable,
            nbtasks : 0,
            nbfacts : jsonFacts.length,
            parts:courseParts,
           // properties:courseData.properties,//jsonCoursedata,
           // stats:coursestats,
          //  rs:coursers,
            tomes:courseTomes,
            navigation:navigation,
            indicators:cIndicators,
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
        return res.status(500).type('application/json').json({error:'Error: ' + error});
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

            CoReaDa.findOne({}).exec(function(err, _coreada){      
                 if(_coreada){
                        _coreada.logs.unshift({'accessType':'Course','name':'addTodo',
                                    'params':[
                                        {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                        {'paramName':'elementURL','paramValue':req.params.tomeId+'/'+req.params.chapterId+'/'+req.params.partId+'/'+req.params.factId},
                                        {'paramName':'content','paramValue':req.body.todo}
                                        ]}); 
                        _coreada.save();             
                    }
            });
            
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

                CoReaDa.findOne({}).exec(function(err, _coreada){      
                 if(_coreada){
                        _coreada.logs.unshift({'accessType':'Course','name':'removeTodo',
                                    'params':[
                                        {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                        {'paramName':'elementURL','paramValue':'0/0/0/'+req.params.factId},
                                        {'paramName':'content','paramValue':_todo.todo}
                                        ]}); 
                        _coreada.save();             
                    }
                });
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

                    CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'removeTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':'0/0/0/0'},
                                            {'paramName':'content','paramValue':_todo.todo}
                                            ]}); 
                            _coreada.save();             
                        }
                    });
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

                 CoReaDa.findOne({}).exec(function(err, _coreada){      
                 if(_coreada){
                        _coreada.logs.unshift({'accessType':'Course','name':'removeTodo',
                                    'params':[
                                        {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                        {'paramName':'elementURL','paramValue':req.params.tomeId+'/0/0/'+req.params.factId},
                                        {'paramName':'content','paramValue':_todo.todo}
                                        ]}); 
                        _coreada.save();             
                    }
                });              
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

                     CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'removeTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/0/0/0'},
                                            {'paramName':'content','paramValue':_todo.todo}
                                            ]}); 
                            _coreada.save();             
                        }
                    });  
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
                 CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'removeTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/'+req.params.chapterId+'/0/'+req.params.factId},
                                            {'paramName':'content','paramValue':_todo.todo}
                                            ]}); 
                            _coreada.save();             
                        }
                    });  
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
                    CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'removeTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/'+req.params.chapterId+'/0/0'},
                                            {'paramName':'content','paramValue':_todo.todo}
                                            ]}); 
                            _coreada.save();             
                        }
                    });
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

                CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'removeTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/'+req.params.chapterId+'/'+req.params.partId+'/'+req.params.factId},
                                            {'paramName':'content','paramValue':_todo.todo}
                                            ]}); 
                            _coreada.save();             
                        }
                    });
                
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

                    CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'removeTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/'+req.params.chapterId+'/'+req.params.partId+'/0'},
                                            {'paramName':'content','paramValue':_todo.todo}
                                            ]}); 
                            _coreada.save();             
                        }
                    });
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
                 CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'editTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':'0/0/0/'+req.params.factId},
                                            {'paramName':'content','paramValue':_todo.todo},
                                            {'paramName':'oldcontent','paramValue':old}
                                            ]}); 
                            _coreada.save();             
                        }
                    });
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
            CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'editTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':'0/0/0/0'},
                                            {'paramName':'content','paramValue':_todo.todo},
                                            {'paramName':'oldcontent','paramValue':old}
                                            ]}); 
                            _coreada.save();             
                        }
                    });              
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
                CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'editTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/0/0/'+req.params.factId},
                                            {'paramName':'content','paramValue':_todo.todo},
                                            {'paramName':'oldcontent','paramValue':old}
                                            ]}); 
                            _coreada.save();             
                        }
                    });           
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
                    CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'editTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/0/0/0'},
                                            {'paramName':'content','paramValue':_todo.todo},
                                            {'paramName':'oldcontent','paramValue':old}
                                            ]}); 
                            _coreada.save();             
                        }
                    }); 

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
                CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'editTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/'+req.params.chapterId+'/0/'+req.params.factId},
                                            {'paramName':'content','paramValue':_todo.todo},
                                            {'paramName':'oldcontent','paramValue':old}
                                            ]}); 
                            _coreada.save();             
                        }
                    });      
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
                    CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'editTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/'+req.params.chapterId+'/0/0'},
                                            {'paramName':'content','paramValue':_todo.todo},
                                            {'paramName':'oldcontent','paramValue':old}
                                            ]}); 
                            _coreada.save();             
                        }
                    });  

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
                CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'editTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/'+req.params.chapterId+'/'+req.params.partId+'/'+req.params.factId},
                                            {'paramName':'content','paramValue':_todo.todo},
                                            {'paramName':'oldcontent','paramValue':old}
                                            ]}); 
                            _coreada.save();             
                        }
                    });  
                
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
                    CoReaDa.findOne({}).exec(function(err, _coreada){      
                     if(_coreada){
                            _coreada.logs.unshift({'accessType':'Course','name':'editTodo',
                                        'params':[
                                            {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                            {'paramName':'elementURL','paramValue':req.params.tomeId+'/'+req.params.chapterId+'/'+req.params.partId+'/0'},
                                            {'paramName':'content','paramValue':_todo.todo},
                                            {'paramName':'oldcontent','paramValue':old}
                                            ]}); 
                            _coreada.save();             
                        }
                    });
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
            if(_coreada){
                        _coreada.logs.unshift({'name':'coreada access',
                                    'params':[
                                        {'paramName':'ip','paramValue':req.connection.remoteAddress}
                                        ]}); 
                        _coreada.save();
             }
         });
         return res.status(200).json('log saved');
    },
     sendaccesslogs: function(req, res){
        var logs=[];
        CoReaDa.findOne({}).exec(function(err, _coreada){
            if(_coreada){
            _coreada.logs.unshift({'name':'coreada stats access',
                        'params':[
                            {'paramName':'ip','paramValue':req.connection.remoteAddress}
                            ]}); 
            _coreada.save();

            logs = _coreada.logs
        }

            

         return res.status(200).json(logs);
       
    });

    },
     resetlogs: function(req, res){        
        CoReaDa.findOne({}).exec(function(err, _coreada){
            var logs = [];
            if(_coreada){
                if(req.body.code=="resyd2008"){
                    _coreada.logs.unshift({'name':'coreada save history - OK',
                            'params':[
                                {'paramName':'ip','paramValue':req.connection.remoteAddress}
                                ]}); 
                    _coreada.archives.concat(_coreada.logs);
                    _coreada.logs = [];
                    
                    _coreada.save();

                    logs = _coreada.logs;
                    return res.status(200).json(logs);
                }
                else{
                    _coreada.logs.unshift({'name':'coreada save history - ERROR',
                            'params':[
                                {'paramName':'ip','paramValue':req.connection.remoteAddress},
                                {'paramName':'code','paramValue':req.body.code}
                                ]}); 
                    _coreada.save();
                    return res.status(500).type('application/json').json({error:'Error: code incorrect'});

                }

            }
             
       
        });

      }
    };
}
