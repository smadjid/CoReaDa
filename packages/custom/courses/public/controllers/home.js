'use strict';

angular.module('mean.courses').controller('HomeController', ['$scope',  '$location', 'Global',
  'Courses', '$http',  'FileUploader',
  function($scope,  $location,  Global, Courses,$http,FileUploader) {
    $scope.global = Global;
    $http.get('/api/coreada/log')
          .success(function(data){
            console.log('access saved')
            })   
          .error(function(data) {             
              console.log('OOps! access not saved')
            }); 
       

    if($('.course_title_top').length>0) $('.course_title_top').remove();



    $scope.availableCircles = [];
    $scope.adminShow = false;
    $scope.tabSelect = 'courses';

    

    $scope.admin = function(){
      if($scope.adminShow){
        $scope.adminShow = false
        $scope.courses = [];
        return;
      }
      swal({   title: "Code d'accès!",   text: "Cette action requiert des provilèges d'administration. Merci d'indiquer le code admin",   
          type: "input",   
      inputType: "password",
          showCancelButton: true,   
          closeOnConfirm: true,   
          animation: "slide-from-top",   
          inputPlaceholder: "Write something" }, 
          function(inputValue){   if (inputValue === false) return false;      
            if (inputValue === "") {     swal.showInputError("Merci d'indiquer le code administrateur!");     return false   }      
          $scope.dataLoading = true;
            
           $http.post('/api/coreada/admin',{'code':inputValue})
         // $http.post('/api/coreada/admin',{'code':'resyd2008'})
          .success(function(data){  
          $scope.adminShow = true;          
            $scope.courses = data.courses;
            $scope.resources = data.resources;


            $scope.dataLoading = false;
            })   
          .error(function(data) {             
              
              swal("Oops!", "Code incorrect. Merci de contacter l'administrateur");
              $scope.dataLoading = false;
            }); 


           });
    }
    var editCourseCode = function(id,code){
      swal({
        title: "Code du cours",
        text: "Le nouveau code à affecter au cours est:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: code
      },
      function(inputValue){
        if (inputValue === false) return false;
        inputValue = inputValue.replace(/ /g,"");
        
        
        if (inputValue === "") 
          swal("Code NON modifié", "Le code du cours est toujours le même : " + code);
        else  {
          $http.post('/api/coreada/updatecode/'+id,{'code':inputValue})
            .success(function(data){ 
              console.log(data)
              $scope.courses = data;
            swal("Code modifié", "Le nouveau code du cours est : " + inputValue);
            return true;
             })
            .error(function(err){swal("Oops!", "Une erreur interne s'est produite");return false;});
        }
              
          
      });
    }
    var editCourseSurveyURL = function(id,url){
      swal({
        title: "URL questionnaire du cours",
        text: "La nouvelle adresse du questionnaire à affecter au cours est:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: url
      },
      function(inputValue){
        if (inputValue === false) return false;
        inputValue = inputValue.replace(/ /g,"");
        
        
        if (inputValue === "") 
          swal("URL du questionnaire", "L'adresse du questionnaire concernant le cours est toujours le même : " + url);
        else  {
          $http.post('/api/coreada/updatesurvey/'+id,{'survey':inputValue})
            .success(function(data){ 
              console.log(data)
              $scope.courses = data;
            swal("URL modifiée", "La nouvelle adresse du questionnaire concernant le cours est : " + inputValue);
            return true;
             })
            .error(function(err){swal("Oops!", "Une erreur interne s'est produite");return false;});
        }
              
          
      });
    }
    $scope.editCourse= function(type,id,val){
      if(type==='code')
        return editCourseCode(id,val);
      else
        return editCourseSurveyURL(id,val)

    }

    $scope.seedCourse = function(code){
       $scope.dataLoading = true;
      $http.get('/api/seed/'+code)
      .success(function(data){
          $scope.courses = data.courses;
         $scope.resources = data.resources;
                 swal("OK !", "Le cours a bien été ajouté au tableau de bord. Merci de noter son code : "+code);

        })
      .error(function(err){
        swal("Oops!", "Une erreur s'est produite");

      });
       $scope.dataLoading = false;
    }
    $scope.seedAllCourses = function(code){
      swal({
      title: "Insérer tous les cours ?", 
      text: "Cette action permettra d'inclure tous les cours sur le tableau de bord avec leurs codes respectifs. Continuer ?", 
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
      confirmButtonColor: "#ec6c62"
    }, function() {
       $scope.dataLoading = true;
       var indexes = [];
       $scope.resources.forEach(function(resrc){
        if(!resrc.exist)
          indexes.push(resrc.code);

       })
      $http.post('/api/seedallresources',{'indexes':indexes})
      .success(function(data){
          $scope.courses = data.courses;
         $scope.resources = data.resources;
         $scope.dataLoading = false;
                 swal("OK !", "Tous les cours ont bien été ajoutés au tableau de bord. ");

        })
      .error(function(err){
        $scope.dataLoading = false;
        swal("Oops!", "Une erreur s'est produite");

      });
       
     })
    }
    $scope.removeCourse = function(id){
      swal({
      title: "Supprimer le cours ?", 
      text: "Êtes vous sur de vouloir suppprimer ce cours ? ATTENTION : Toutes les données de l'analyse vont être perdues sans possibilité de récupération", 
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
      confirmButtonColor: "#ec6c62"
    }, function() {
       $scope.dataLoading = true;
      $http.delete('/api/coreada/delete/'+id)
      .success(function(data){  
        $scope.courses = data.courses;
         $scope.resources = data.resources;
                 swal("OK !", "Le cours et ses données ont bien été supprimés");
         

            $scope.dataLoading = false;
            })   
          .error(function(data) {             
              
              swal("Oops!", "Une erreur s'est produite");
              $scope.dataLoading = false;
            }); 
    })
      
    

    }
$scope.dropAllCourses = function(id){
      swal({
      title: "Supprimer TOUS les cours ?", 
      text: "Êtes vous sur de vouloir suppprimer tous les cours ? ATTENTION : Toutes les données vont être perdues sans possibilité de récupération", 
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
      confirmButtonColor: "#ec6c62"
    }, function() {
       $scope.dataLoading = true;
      $http.delete('/api/coreada/deleteallcourses')
      .success(function(data){  
        console.log(data)
        $scope.courses = data.courses;
              $scope.resources = data.resources;
        swal("OK !", "Tous les cours ont bien été supprimés");
           
            $scope.dataLoading = false;
            })   
          .error(function(data) {             
              
              swal("Oops!", "Une erreur s'est produite");
              
              $scope.dataLoading = false;
            }); 
    })
      
    

    }

    $scope.courseCoder = function(coursecodeform){     console.log($scope.courseCode) 
      $scope.courses = []
        if (coursecodeform.$valid) {
          $scope.dataLoading = true;
          $('#loadCourseBtn').text('Chargement ...')
        
          $http.get('/api/find/'+$scope.courseCode)
          .success(function(data){
              $scope.courses = data;
              $('#loadCourseBtn').text('Charger');
              $scope.dataLoading = false;
            })   
          .error(function(data) {             
              swal("Oops", "Aucun cours trouvé pour ce code", "error");   
              $('#loadCourseBtn').text('Charger')           ;
              $scope.dataLoading = false;
            }); 
        };

         if($('.course_title_top').length>0) $('.course_title_top').remove();
      
    }


  

    $scope.findCourse = function() {
      Courses.query(function(courses) {
     //   $scope.courses = courses; 

       
        

      });
    };
      $scope.find = function() {
       Courses.query('nodejs',function(courses) {
      //  $scope.courses = courses; 

        if($('.course_title_top').length>0) $('.course_title_top').remove();
        

      }); 
    };

    //////////////// FEEDBACKS
$scope.result = 'hidden'
    $scope.resultMessage;
    $scope.feedbackFormData; //feddbackFormData is an object holding the name, email, subject, and message
    $scope.submitButtonDisabled = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitted

    
$scope.expandCallback = function (index, id) {
  $scope.accordion.expand(3)
  window.setTimeout(function() {    
    $('.indexScroller').scroll();
   }, 0);

};


      $scope.sendFeedback = function(facteval) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
        var feedback ={
          'inputName':$scope.feedbackFormData.inputName,
          'inputEmail':$scope.feedbackFormData.inputEmail,
          'inputSubject':$scope.feedbackFormData.inputSubject,
          'inputMessage':$scope.feedbackFormData.inputMessage
        }
        
      //  return;
        
          $http.post('/api/feedback',{'feedback':feedback})
          .success(function(data){
                    $scope.submitButtonDisabled = true;
                    $scope.resultMessage = data.message;
                    $scope.result='bg-success';
               swal({   title: "Merci!",   
            text: "Nous avons bien reçu votre commentaire. Merci.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
            })
          .error(function(data) {
              swal("Oops", "Une erreur interne du serveur est survenue. Le message n'a pas probablement pas pu être envoyé", "error");
              $scope.submitButtonDisabled = false;
                    $scope.resultMessage = data.message;
                    $scope.result='bg-danger';
            }); 
    }

    $('.indexScroller').scroll();

    /// ACCESS
    $scope.logs=[];


    $scope.getLogs = function(){
        $http.get('/api/coreada/accesslogs')
          .success(function(data){            
            $scope.logs = data
            })   
          .error(function(data) {             
              console.log('OOps! access not retrieved')
            }); 
    }
    $scope.resetLogs= function(){
      // var code = prompt("Code d'accès administrateur", "");
        swal({   title: "Code d'accès!",   text: "Cette action requiert des provilèges d'administration. Merci d'indiquer le code admin",   
          type: "input",   
      inputType: "password",
          showCancelButton: true,   
          closeOnConfirm: false,   
          animation: "slide-from-top",   
          inputPlaceholder: "Write something" }, 
          function(inputValue){   if (inputValue === false) return false;      
            if (inputValue === "") {     swal.showInputError("Merci d'indiquer le code administrateur!");     return false   }      

            $http.post('/api/coreada/resetlogs',{'code':inputValue})
          .success(function(data){            
            $scope.logs = data;
             swal("DONE!", "La table a été archivée");
            })   
          .error(function(data) {             
              
              swal("Oops!", "Code incorrect. Merci de contacter l'administrateur");
            }); 


           });
             
        
    }

    //$scope.getLogs();
    $scope.structFileName='';
    $scope.dataFileName = '';
     $scope.uploadFile = function(){
        var filename = ''
        if(event.target.files.length>0) filename = event.target.files[0].name;

 var input   = $( event.target );
$(input).next('label').children('span').text(filename);


        if($(event.currentTarget).attr('id') ==='file-structure') 
          $scope.structFileName = filename;
        if($(event.currentTarget).attr('id') ==='file-data') 
          $scope.dataFileName = filename;

        $scope.$apply();
    };

    /*       FILE UPLOADER    */
  $( '.inputfileOLD' ).each( function()
  {
    var $input   = $( this ),
      $label   = $input.next( 'label' ),
      labelVal = $label.html();

    $input.on( 'change', function( e )
    {
      var fileName = '';

      if( this.files && this.files.length > 1 )
        fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
      else if( e.target.value )
        fileName = e.target.value.split( '\\' ).pop();


      if( fileName )
        $label.find( 'span' ).html( fileName );
      else
        $label.html( labelVal );
    });

    // Firefox bug fix
    $input
    .on( 'focus', function(){ $input.addClass( 'has-focus' ); })
    .on( 'blur', function(){ $input.removeClass( 'has-focus' ); });
  });
    
    var uploader = $scope.uploader = new FileUploader({
            url: '/api/coreada/upload'
        });

        // FILTERS

        uploader.filters.push({
            name: 'customFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 2;
            }
        });

        // CALLBACKS

        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };

        
    /*       END FILE UPLOADER    */
    
   
  }
]);
