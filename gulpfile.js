const fs = require('fs');
const gulp = require('gulp');
const wrap = require('gulp-wrap');
const concat = require('gulp-concat');
const header = require('gulp-header');
const uglify = require('gulp-uglify');
const eslint = require('gulp-eslint');
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

gulp.task('lint', () => {
  return gulp.src([
    'src/**/*.js',
    '!src/qrcode-light.js',
  ])
  .pipe(concat(`qrgen-lint.js`))
  .pipe(gulp.dest('dist/'))
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});

gulp.task('watch', ['default'], () => {
  gulp.watch('src/**/*.js', ['build']);
  gulp.watch('scripts/demo/**', ['demo']);
});
