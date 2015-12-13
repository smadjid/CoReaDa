
  // inject the Todo service factory into our controller

courseModule.controller('ToDoController', ['$scope', '$http','Todos', function ($scope, $http,Todos) {
    $scope.tasks = {};
    $scope.editIndex = false;

    // GET =====================================================================
    // when landing on the page, get all todos and show them
    // use the service to get all the todos
    Todos.get()
      .success(function(data) {
        $scope.tasks = data;
        $scope.formData = {};
        $scope.loading = false;
        console.log(data);
      })
        .error(function(data) {
            console.log('Error: ' + data);
        });

      // Add task ==================================================================
    // when submitting the add form, send the text to the node API

  
  $scope.addTask = function () {
    
    if( $scope.editIndex === false){        

      $scope.tasks.push({task: $scope.formData.text, done: false});


      // validate the formData to make sure that something is there
      // if form is empty, nothing will happen
      if ($scope.formData.text != undefined) {
        $scope.loading = true;

        // call the create function from our service (returns a promise object)
        Todos.addtask($scope.formData)

          // if successful creation, call our get function to get all the new todos
          .success(function(data) {
            $scope.loading = false;
            $scope.formData = {}; // clear the form so our user is ready to enter another
            $scope.tasks = data; // assign our new list of todos
          });
      }


    } 
    else {
      $scope.tasks[$scope.editIndex].task = $scope.task;
    }
    $scope.editIndex = false;
    $scope.task = '';
  }
    
  $scope.editTask = function (index) {
    $scope.task = $scope.tasks[index].task;
    $scope.editIndex = index;
  }
  $scope.doneTask = function (index) {
    $scope.tasks[index].done = true;
  }
  $scope.unDoneTask = function (index) {
    $scope.tasks[index].done = false;
  }
  $scope.deleteTask = function (index) {
    //$scope.tasks.splice(index, 1);
    Todos.delete(index)
          .success(function(data) {
            $scope.loading = false;
            $scope.formData = {}; // clear the form so our user is ready to enter another
            $scope.tasks = data; // assign our new list of todos
          });

  }

$scope.seedData = function () {
    //$scope.tasks.splice(index, 1);
    Todos.seed()
          .success(function(data) {
            $scope.loading = false;
            $scope.formData = {}; // clear the form so our user is ready to enter another
            $scope.tasks = data; // assign our new list of todos
          });

  }

  }]); 

