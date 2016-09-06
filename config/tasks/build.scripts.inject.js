/**
 * Dependencies
 */
var concat = require('ui-gulp_tasks/node_modules/gulp-concat');
var size = require('ui-gulp_tasks/node_modules/gulp-size');
var plumber = require('ui-gulp_tasks/node_modules/gulp-plumber');
var log = require('ui-gulp_tasks/log');
var mergeStream = require('ui-gulp_tasks/node_modules/merge-stream');
var mkdirp = require('ui-gulp_tasks/node_modules/mkdirp');
var replace = require('ui-gulp_tasks/node_modules/gulp-replace');
var fs = require('fs');

/**
 * Name
 */
var taskname = 'build:scripts-inject';

/**
 * Module
 */
module.exports = function (gulp, paths, bundles) {
    if (!gulp || !paths || !bundles) {
        return log.module(taskname);
    }

    /**
     * Task
     */
    gulp.task(taskname, function () {
        if (!paths.build || !paths.build.scripts || !bundles.scripts || !Object.keys(bundles.scripts).length) {
            return log.task(taskname);
        }

        /**
         * Configuration
         */
        mkdirp.sync(paths.build.scripts);

        /**
         * Execution
         */
        var tasks = [];

        var replaceFunction = function(string) {
            string = string
                .replace('require(\'', '')
                .replace('\');', '');
            return fs.readFileSync(string + '.js', 'utf8').replace(/require\((.*)\)\;/g, replaceFunction);
        };

        Object.keys(bundles.scripts).forEach(function (name) {
            tasks.push(
                gulp.src(bundles.scripts[name])
                .pipe(replace(/require\((.*)\)\;/g, replaceFunction))
                .pipe(plumber())
                .pipe(concat(name + '.js'))
                .pipe(size({'title': 'Size of JS bundle (build) "' + name + '.js":'}))
                .pipe(gulp.dest(paths.build.scripts))
            );
        });
        return mergeStream(tasks);
    });
};
