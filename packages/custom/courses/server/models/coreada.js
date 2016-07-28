'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;



/**
 * Actions Schema
 */
var ActionParamsSchema = new Schema({   
  paramName:{
    type:String
  },  
  paramValue:{
    type:String
  }
});

var LogRecordSchema = new Schema({  
  accessType:{
    type:String,
    default: 'CoReaDa'
  },  
  date: {
    type: Date,
    default: Date.now
  },
  name:{
    type:String,
    required: true
  },
   courseId:{
    type:String,
    default: null
  },
  
  params:[ActionParamsSchema]
});


/**
 * Course Schema
 */
var CoReaDaSchema = new Schema({  
  logs:[LogRecordSchema]
});


mongoose.model('CoReaDa', CoReaDaSchema);
