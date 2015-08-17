var gulp = require('gulp');
var wrap = require('gulp-wrap');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var pkg = require('./package.json');
var banner = [
	'/**',
	' * <%= pkg.title %> - <%= pkg.description %>',
	' * @version v<%= pkg.version %>',
	' * @license <%= pkg.license %>',
	' * @author <%= pkg.author %>',
	' *',
	' * QRCode Generator for JavaScript',
	' * Copyright (c) 2009 Kazuhiko Arase',
	' * URL: http://www.d-project.com/',
	' */',
	'',
].join('\n');

gulp.task('default', function () {
	return gulp.src('src/*.js')
		.pipe(concat('qrgen.js'))
		.pipe(wrap('(function(){\n<%=contents%>\n}());'))
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest('dist/'))
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('watch', function () {
  return gulp.watch('src/*.js', ['default']);
});
