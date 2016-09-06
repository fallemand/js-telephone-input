/**
 * Tasks dependencies
 */
var gulp = require('gulp');
var gulpSync = require('gulp-sync')(gulp);
var bundles = require('./config/bundles');
var paths = require('./config/paths');

/**
 * Tasks modules
 */
var deploySwift = require('ui-gulp_tasks/tasks/deploy.swift');
var deployGHpages = require('ui-gulp_tasks/tasks/deploy.ghpages');
var tasks = [
    require('ui-gulp_tasks/tasks/build.clean'),
    require('./config/tasks/build.scripts.inject'),
    require('ui-gulp_tasks/tasks/build.styles'),
    require('ui-gulp_tasks/tasks/build.images'),
    require('ui-gulp_tasks/tasks/dist.clean'),
    require('ui-gulp_tasks/tasks/dist.scripts'),
    require('ui-gulp_tasks/tasks/dist.styles'),
    require('ui-gulp_tasks/tasks/dist.images')
];

/**
 * Register tasks
 */
tasks.forEach(function (task) {
    task(gulp, paths, bundles);
});

deploySwift(gulp, paths, bundles, {
    'department': 'ui',
    'user': '[USER]',
    'password': '[PASSWORD]',
    'container': 'statics',
    'friendlyUrl': 'FRIENDLY-URL',
    'verbose': true
});

deployGHpages(gulp, paths);

/**
 * Custom tasks
 */
gulp.task('build', gulpSync.sync([
    'build:clean',
    [
        'build:scripts-inject',
        'build:styles',
        'build:images'
    ]
]));

gulp.task('watch', function () {
    gulp.start('build');
    gulp.watch(['./src/styles/**/*.scss'], ['build:styles']);
    gulp.watch(['./config/**/*.js', './src/**/*.js'], ['build:scripts-inject']);
});

gulp.task('dist', gulpSync.sync([
    'build',
    'dist:clean',
    [
        'dist:scripts',
        'dist:styles',
        'dist:images'
    ]
]));
