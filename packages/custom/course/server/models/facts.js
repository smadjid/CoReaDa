 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Facts Schema
 */
var FactSchema = new Schema({
	part_id:{
		type: Schema.Types.ObjectId,
		ref: 'Part'
	},  
  
  name: {
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
  }
});

mongoose.model('Fact', FactSchema);
