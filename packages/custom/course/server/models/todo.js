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

text : {type : String, default: 'Review...'}
});


mongoose.model('Todo', TodoSchema);
