'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Course = mongoose.model('Course'),
    config = require('meanio').loadConfig(),
    _ = require('lodash');
    module.exports = function(Courses) {

    return {
        /**
         * Find Course by id
         */
        Course: function(req, res, next, id) {
            Course.load(id, function(err, Course) {
                if (err) return next(err);
                if (!Course) return next(new Error('Failed to load Course ' + id));
                req.Course = Course;
                next();
            });
        },
        
        
        /**
         * Delete an Course
         */
        destroy: function(req, res) {
            var Course = req.Course;


            Course.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the Course'
                    });
                }

                Courses.events.publish({
                    action: 'deleted',
                    user: {
                        name: req.user.name
                    },
                    name: Course.title
                });

                res.json(Course);
            });
        },
        
        /**
         * List of Courses
         */
        all: function(req, res) {
            var query = req.acl.query('Course');

            query.find({}).sort('-created').populate('user', 'name username').exec(function(err, Courses) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the Courses'
                    });
                }

                res.json(Courses)
            });

        }
    };
}