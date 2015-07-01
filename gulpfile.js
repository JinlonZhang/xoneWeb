/**
 * CSS,JS压缩合并
 * Created by allen on 14-6-29.
 */

var gulp = require('gulp');
var gUtil = require('gulp-util');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var concat = require('gulp-concat');

var dir = './public/src/js/';
var js = [
    dir + 'lib/jquery-1.9.1.min.js',
    dir + 'lib/*.js',
    dir + 'ui/UI.Base.js',
    dir + 'ui/UI.*.js',
    dir + 'app/app.bind.js',
    dir + 'app/app.common.js',
    dir + 'page/*.js'
];

gulp.task('concatCSS', function(){
    gulp.src(['./public/src/css/*.css', './public/src/css/ui/*.css', './public/src/css/page/*.css'])
        .pipe(minify())
        .pipe(concat('base.css'))
        .pipe(gulp.dest('./public/build/css/'))
})

gulp.task('concatJS', function(){
    gulp.src(js)
        .pipe(uglify())
        .pipe(concat('base.js'))
        .pipe(gulp.dest('./public/build/js/'))
})

gulp.task('copyImg', function(){
    gulp.src(['./public/src/img/*.*'])
        .pipe(gulp.dest('./public/build/img/'))
})

gulp.task('copyIcoFont', function(){
    gulp.src(['./public/src/css/ui/ico.*'])
        .pipe(gulp.dest('./public/build/css/'))
})

gulp.task('default', ['concatCSS', 'concatJS', 'copyImg', 'copyIcoFont']);