const fs = require('fs');
const gulp = require('gulp');
const wrap = require('gulp-wrap');
const concat = require('gulp-concat');
const header = require('gulp-header');
const uglify = require('gulp-uglify');
const pkg = require('./package.json');
const isProd = process.env.NODE_ENV === 'production';
const banner = `\
/**
 * <%= pkg.title %> - <%= pkg.description %>
 * @version v<%= pkg.version %>
 * @license <%= pkg.license %>
 * @author <%= pkg.author %>
 */
`;

gulp.task('build', () => {
  var stream = gulp.src('src/**/*.js')
  .pipe(concat(`qrgen.js`))
  .pipe(wrap({src: 'scripts/exports.js'}));
  if (isProd) stream = stream
  .pipe(uglify({
    mangleProperties: {
      regex: /^m_/,
    },
  }));
  stream = stream
  .pipe(header(banner, {pkg: pkg}))
  .pipe(gulp.dest('dist/'));
  return stream;
});

gulp.task('demo', () => {
  return gulp.src('scripts/demo/**')
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['build', 'demo']);

gulp.task('watch', ['default'], () => {
  gulp.watch('src/**/*.js', ['build']);
  gulp.watch('scripts/demo/**', ['demo']);
});
