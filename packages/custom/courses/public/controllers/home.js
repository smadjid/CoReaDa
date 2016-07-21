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
          $('#loadCourseBtn').text('Chargement en cours')
        
          $http.get('/api/find/'+$scope.courseCode)
          .success(function(data){
              $scope.courses = data;
              $('#loadCourseBtn').text('Charger')
            })   
          .error(function(data) {             
              swal("Oops", "Aucun cours trouvé pour ce code", "error");   
              $('#loadCourseBtn').text('Charger')           
            }); 
        };
        


      
    }


  

    $scope.findCourse = function() {
      Courses.query(function(courses) {
     //   $scope.courses = courses; 

        if($('.course_title_top').length>0) $('.course_title_top').remove();
        

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
    $scope.sendFeedback = function(contactform) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
       
        if (contactform.$valid) {
          $http.post('/api/feedback',$scope.feedbackFormData)
          .success(function(data){
                console.log(data);
               
                    $scope.submitButtonDisabled = false;
                    $scope.resultMessage = data.message;
                    $scope.result='bg-success';
               swal({   title: "Merci!",   
            text: "Nous avons bien reçu votre message. Merci.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
              $('#contactform')[0].reset();
            })
          .error(function(data) {
              swal("Oops", "Une erreur interne du serveur est survenue. Le message n'a pas probablement pas pu être envoyé", "error");
              $scope.submitButtonDisabled = true;
                    $scope.resultMessage = data.message;
                    $scope.result='bg-danger';
            });  
            console.log($scope.feedbackFormData)
        } else {
           // $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Failed :( Please fill out all the fields.';
            $scope.result='bg-danger';
        }
    }

   
  }
]);
