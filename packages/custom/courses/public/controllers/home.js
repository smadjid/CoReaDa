'use strict';

angular.module('mean.courses').controller('HomeController', ['$scope',  '$location', 'Global',
  'Courses', '$http',  
  function($scope,  $location,  Global, Courses,$http) {
    $scope.global = Global;

    if($('.course_title_top').length>0) $('.course_title_top').remove();



    $scope.availableCircles = [];

    $scope.courseCoder = function(coursecodeform){      
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

    


      $scope.sendFeedback = function(facteval) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
        var feedback ={
          'inputName':$scope.feedbackFormData.inputName,
          'inputEmail':$scope.feedbackFormData.inputEmail,
          'inputSubject':$scope.feedbackFormData.inputSubject,
          'inputMessage':$scope.feedbackFormData.inputMessage
        }
        console.log(feedback);
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

   
  }
]);
