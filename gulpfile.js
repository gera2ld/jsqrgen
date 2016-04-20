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
));

gulp.task('bower', ['build'], () => {
  const bower = require('./bower.json');
  bower.version = pkg.version;
  return new Promise((resolve, reject) => {
    fs.writeFile('./bower.json', JSON.stringify(bower, null, 2), err => err ? reject(err) : resolve());
  });
});

gulp.task('watch', () => gulp.watch('src/**/*.js', ['build']));
