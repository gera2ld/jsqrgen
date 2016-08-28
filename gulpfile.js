const fs = require('fs');
const gulp = require('gulp');
const wrap = require('gulp-wrap');
const concat = require('gulp-concat');
const header = require('gulp-header');
const pkg = require('./package.json');
const banner = `\
/**
 * <%= pkg.title %> - <%= pkg.description %>
 * @version v<%= pkg.version %>
 * @license <%= pkg.license %>
 * @author <%= pkg.author %>
 */
`;

gulp.task('build', () => {
  return gulp.src('src/**/*.js')
  .pipe(concat('qrgen.js'))
  .pipe(wrap({src: 'scripts/exports.js'}))
  .pipe(header(banner, {pkg: pkg}))
  .pipe(gulp.dest('dist/'));
});

gulp.task('watch', ['build'], () => {
  return gulp.watch('src/**/*.js', ['build']);
});
