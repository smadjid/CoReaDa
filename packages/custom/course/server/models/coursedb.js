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
  norm_description: {
    type: String
  }, 
  norm_value: {
    type: String
  },
  suggestion : [TodoSchema]
});

/**
 * Description Schema
 */
var DescriptionSchema = new Schema({
  property: {
    type: String,
    trim: true
  },
  value: {
    type: String
  }

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
  parent_id: {
    type: Number
  },
  part_type: {
    type: String
  },
  title: {
    type: String
  },
  properties: [DescriptionSchema],
  todos: [TodoSchema],
  facts: [FactSchema]
});
/**
 * Chapter Schema
 */
var ChapterSchema = new Schema({
  id: {
    type: Number
  },
  part_id: {
    type: Number
  },
  title: {
    type: String
  },
  parts: [PartSchema],
  properties: [DescriptionSchema],
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
  properties: [DescriptionSchema],
  parts: [PartSchema],
  chapters: [ChapterSchema],
  facts: [FactSchema],
  todos: [TodoSchema]
});


mongoose.model('CourseDB', CourseSchema);