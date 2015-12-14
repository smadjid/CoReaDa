'use strict';

/**
 * Module dependencies. 
 */
var mongoose = require('mongoose'),
    Todo = mongoose.model('Todo'),
    config = require('meanio').loadConfig(),
    _ = require('lodash');

function getTodos(res){
    Todo.find(function(err, todos) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(todos); // return all todos in JSON format
        });
};

function seedData(res){
 var todo =  Todo.create({  text : "seed",done : false})
 var part =  Part.create({id : 166 ,part_id : 1, title : 'titre', todos : [todo]})
 
};

function getOneTodo(res){
    Todo.find(function(err, todos) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(todos); // return all todos in JSON format
        });
};

module.exports = function(Todos) {
    return {
        /**
         * Create a todo
         */
        create: function(req, res) {            

            Todo.create({
            text : req.body.text,
            done : false
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            getTodos(res);
        });


           ;
        },
        // delete a todo
        destroy:function(req, res) {
            console.log(req.params.todoId);
            Todo.remove({
            _id : req.params.todoId
        }, function(err, todo) {
            if (err)
                res.send(err);

            getTodos(res);
        });

        },
        /**
         * Get a Todo
         */
        locate: function(req, res) {
            // use mongoose to get all todos in the database
            getOneTodo(res);
            

        },
       /**
         * List of Todos
         */
        all: function(req, res) {
            // use mongoose to get all todos in the database
            getTodos(res);
            

        },

        seed: function(req, res) {
            // use mongoose to get all todos in the database
            seedData(res);
            

        }
    };
}