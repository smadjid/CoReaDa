 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Author Schema
 */
var AuthorSchema = new Schema({	
  name: {
    type: String,
    required: true,
    trim: true
  },
  updated: {
    type: Array
  },
});



mongoose.model('Author', AuthorSchema);
