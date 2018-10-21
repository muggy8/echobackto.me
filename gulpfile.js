const gulp = require("gulp")
const minify = require('gulp-minify')
const cleanCSS = require('gulp-clean-css')
const htmlmin = require('gulp-htmlmin')

gulp.task("move", function(){
	return gulp
		.src(["src/**/*.js", "src/**/*.css", "src/**/*.html"])
		.pipe(gulp.dest('www'))
})

gulp.task("minifyCSS", ["move"], function(){
	return gulp
		.src('www/**/*.css')
		.pipe(cleanCSS())
		.pipe(gulp.dest('www'))
})

gulp.task("minifyJS", ["minifyCSS"], function(){
	return gulp
		.src('www/**/*.js')
	    .pipe(minify())
	    .pipe(gulp.dest('www'))
})

gulp.task("minifyHTML", ["minifyJS"], function(){
	return gulp
		.src('www/**/*.html')
	    .pipe(htmlmin({collapseWhitespace: true}))
	    .pipe(gulp.dest('www'))
})

gulp.task("hash", ["minifyHTML"],  function(){

})

gulp.task("default", ["hash"], async function(){

})
