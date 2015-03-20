var gulp=require('gulp'),
		wrap=require('gulp-wrap'),
		rename=require('gulp-rename'),
		concat=require('gulp-concat'),
		uglify=require('gulp-uglify');

gulp.task('default',function(){
	return gulp.src(['src/qrcode-light.js','src/qrgen-canvas.js'])
		.pipe(concat('qrgen.js'))
		.pipe(wrap('(function(){\n<%=contents%>\n}());'))
		.pipe(gulp.dest('dist/'))
		.pipe(uglify())
		.pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest('dist/'));
});
