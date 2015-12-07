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
	/*part:{
		type: Schema.Types.ObjectId,
		ref: 'Parts'
	},  */
  part:{
    type: Number,
    ref: 'Parts'
  },
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  }
});

mongoose.model('Fact', FactSchema);
