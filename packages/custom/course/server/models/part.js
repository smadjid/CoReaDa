 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Part Schema
 */
var PartSchema = new Schema({
	course:{
		type: Schema.Types.ObjectId,
		ref: 'Course'
	},
  parent:{
    type: Schema.Types.ObjectId,
    ref: 'Part'
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
});

mongoose.model('Part', PartSchema);
