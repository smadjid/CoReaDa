'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var list = {
    'spec': {
      description: 'Course operations',
      path: '/courses',
      method: 'GET',
      summary: 'Get all Courses',
      notes: '',
      type: 'Course',
      nickname: 'getCourses',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var create = {
    'spec': {
      description: 'Device operations',
      path: '/courses',
      method: 'POST',
      summary: 'Create course',
      notes: '',
      type: 'Course',
      nickname: 'createCourse',
      produces: ['application/json'],
      parameters: [{
        name: 'body',
        description: 'Course to create.  User will be inferred by the authenticated user.',
        required: true,
        type: 'Course',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  swagger.addGet(list)
    .addPost(create);

};
