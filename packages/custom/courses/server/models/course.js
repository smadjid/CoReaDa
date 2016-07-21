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
  title: {
    type: String
  },
  content: {
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
  done:{
    type: Boolean, 
    default: false
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
  issueCode: {
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
  delta: {
    type: Number
  }, 
  norm_value: {
    type: String
  },
  gravity: {
    type: String
  },
  suggestion_title: {
    type: String
  },
  suggestion_content: {
    type: String
  },
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
 * RS Schema
 */
var RSSchema = new Schema({
  nparts: {
    type: String
  },
  duration: {
    type: Number
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
  url: {
    type: String
  },

  actions: {
    type: Number
  },
  nbactions: {
    type: Number
  },
  reread: {
    type: Number
  },
  stop: {
    type: Number
  },
  speed: {
    type: Number
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
  url: {
    type: String
  },
  elementType:{
    type:String
  },

  actions: {
    type: Number
  },
  nbactions: {
    type: Number
  },
  reread: {
    type: Number
  },
  stop: {
    type: Number
  },
  speed: {
    type: Number
  },

  parts: [PartSchema],
  properties: [DescriptionSchema],
  todos: [TodoSchema],
  facts: [FactSchema]
});


/**
 * Tome Schema
 */
var TomeSchema = new Schema({
  id: {
    type: Number
  },
  part_id: {
    type: Number
  },
  title: {
    type: String
  },
  url: {
    type: String
  },
  elementType:{
    type:String
  },
  chapters: [ChapterSchema],
  properties: [DescriptionSchema],
  todos: [TodoSchema],
  old_todos: [TodoSchema],
  facts: [FactSchema],
  old_facts: [FactSchema]
});

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
  date: {
    type: Date,
    default: Date.now
  },
  elementId:{
    type:String,
    required: true
  },
  name:{
    type:String,
    required: true
  },
  params:[ActionParamsSchema]
});
/**
 * Course Schema
 */
var CourseSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  courseCode: {
    type: String
  },
  url: {
    type: String
  },
  content: {
    type: String,
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: {
    type: Array
  },
  updated: {
    type: Date,
    default: Date.now
  },
  ob_begin:{
    type:String
  },
  ob_end:{
    type:String
  },
  nbfacts: {
    type: Number,
    default: 0
  },
  nbtasks: {
    type: Number,
    default: 0
  },



  elementType:{
    type:String
  },
  properties: [DescriptionSchema],
  parts: [PartSchema],
  tomes: [TomeSchema],
  facts: [FactSchema],
  todos: [TodoSchema],
  rs:[RSSchema],
  stats:[DescriptionSchema],
  logs:[LogRecordSchema]
});




/**
 * Statics
 */
CourseSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Course', CourseSchema);
