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
  },
  elementType:{
    type:String
  }
});



/**
 * Todo Schema
 */

var TodoSchema = new Schema({   
  classof: {
    type: String
  },
  todo: {
    type: String,
    default: 'Review...'
  },
  elementType:{
    type:String
  },
  created:{
    type: Date, 
    default: Date.now
  },
  updated:{
    type: Date, 
    default: Date.now
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
  elementType:{
    type:String
  },
  value: {
    type: String
  },  
  description: {
    type: String
  }, 
  norm_value: {
    type: String
  },
  gravity: {
    type: String
  },
  suggestion : [TodoSchema],
  todos : [TodoSchema]
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
  parent: {
    type: String
  },
  part_type: {
    type: String
  },
  elementType:{
    type:String
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
  elementType:{
    type:String
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
  elementType:{
    type:String
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