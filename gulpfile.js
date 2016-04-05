const gulp = require('gulp');
const wrap = require('gulp-wrap');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const header = require('gulp-header');
const replace = require('gulp-replace');
const pkg = require('./package.json');
const banner = `\
/**
 * <%= pkg.title %> - <%= pkg.description %>
 * @version v<%= pkg.version %>
 * @license <%= pkg.license %>
 * @author <%= pkg.author %>
 *
 * QRCode Generator for JavaScript
 * Copyright (c) 2009 Kazuhiko Arase
 * URL: http://www.d-project.com/
 */
`;

gulp.task('build', () => (
  gulp.src('src/lib/*.js')
  .pipe(concat('qrgen.js'))
  .pipe(wrap({src: 'src/exports.js'}))
  .pipe(header(banner, {pkg: pkg}))
  .pipe(gulp.dest('dist/'))
  .pipe(uglify())
  .pipe(header(banner, {pkg: pkg}))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('dist/'))
));

gulp.task('bower', ['build'], () => (
  gulp.src('tools/bower/bower.json')
  .pipe(replace('__VERSION__', pkg.version))
  .pipe(gulp.dest('.'))
));

gulp.task('watch', () => gulp.watch('src/**/*.js', ['default']));
