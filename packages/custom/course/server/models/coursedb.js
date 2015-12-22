 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;



/**
 * Suggestions Schema
 */
var SuggestionSchema = new Schema({ 
  name: {
    type: String
  },
  value: {
    type: Number
  }
});



/**
 * Todo Schema
 */

var TodoSchema = new Schema({ 
  type: {
    type: String
  },
  todo: {
    type: String,
    default: 'Review...'
  },
  suggestions : [SuggestionSchema]
});


/**
 * Facts Schema
 */
var FactSchema = new Schema({ 
  name: {
    type: String
  },
  classof: {
    type: String
  },
  type: {
    type: String
  },
  value: {
    type: String
  },  
  explanation: {
    type: String
  }, 
  priority: {
    type: String
  },
  suggestion : [TodoSchema]
});


/**
 * Part Schema
 */
var PartSchema = new Schema({
  id: {
    type: Number
  },
  part_id: {
    type: Number
  },
  title: {
    type: String
  },
 /* updated: {
    type: Array
  },*/
  todos: [TodoSchema],
  facts: [FactSchema]
});

/**
 * Course Schema
 */
var CourseSchema = new Schema({
  /*author:{
    type: Schema.Types.ObjectId,
    ref: 'Author'
  },
  created: {
    type: Date,
    default: Date.now
  },*/
  title: {
    type: String,
    trim: true
  },
  version: {
    type: Number
  },
  
 /* permissions: {
    type: Array
  },
  updated: {
    type: Array
  },*/
  parts: [PartSchema],
  facts: [FactSchema],
  todos: [TodoSchema]
});


mongoose.model('CourseDB', CourseSchema);