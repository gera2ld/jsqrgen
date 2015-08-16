var gulp=require('gulp'),
		wrap=require('gulp-wrap'),
		rename=require('gulp-rename'),
		concat=require('gulp-concat'),
		uglify=require('gulp-uglify'),
		header=require('gulp-header'),
		pkg=require('./package.json');
var banner=[
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

gulp.task('default',function(){
	return gulp.src('src/*.js')
		.pipe(concat('qrgen.js'))
		.pipe(wrap('(function(){\n<%=contents%>\n}());'))
		.pipe(gulp.dest('dist/'))
		.pipe(uglify())
		.pipe(header(banner,{pkg:pkg}))
		.pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('watch', function () {
  return gulp.watch('src/*.js', ['default']);
});
