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
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
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
    type: String,
    required: true
  },
  classof: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  suggestion : [TodoSchema]
});


/**
 * Part Schema
 */
var PartSchema = new Schema({
  id: {
    type: Number,
    required: true
  },
  part_id: {

    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  updated: {
    type: Array
  },
  facts: [FactSchema]
});

/**
 * Course Schema
 */
var CourseSchema = new Schema({
  author:{
    type: Schema.Types.ObjectId,
    ref: 'Author'
  },
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: Number,
    required: true
  },
  
  permissions: {
    type: Array
  },
  updated: {
    type: Array
  },
  facts: [FactSchema],
  todos: [TodoSchema]
});


mongoose.model('Part', PartSchema);
