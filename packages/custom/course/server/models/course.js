 'use strict';

/**
 * Module dependencies.
 */ 
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


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
});



mongoose.model('Course', CourseSchema);
