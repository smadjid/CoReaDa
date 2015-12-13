 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Todos Schema
 */
var TodoSchema = new Schema({	
part_id:{
		type: Schema.Types.ObjectId,
		ref: 'Part'
	},  
associated_fact_class : {type : String, default: 'None'},
//associated_fact_type : {type : String, default: 'None'},
text : {type : String, default: 'Review...'}
});


mongoose.model('Todo', TodoSchema);
