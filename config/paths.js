// Paths relative to gulpfile
var build = './ui-build/';
var dist = './ui-dist/';

exports.build = {
    'root': build,
    'styles': build + 'css/',
    'scripts': build + 'js/',
    'images': build + 'images/',
    'fonts': build + 'fonts/',
    'templates': build + 'templates/',
    'assets': build + 'assets/',
    'mocks': build + 'mocks/'
};

exports.dist = {
    'root': dist,
    'styles': dist + 'css/',
    'scripts': dist + 'js/',
    'images': dist + 'images/',
    'fonts': dist + 'fonts/'
};
