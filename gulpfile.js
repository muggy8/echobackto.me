const gulp = require("gulp")
const minify = require('gulp-minify')
const cleanCSS = require('gulp-clean-css')
const htmlmin = require('gulp-htmlmin')
const hashsum = require("gulp-hashsum")
const clean = require('gulp-clean')

gulp.task("removePrevious", function(){
	return gulp
		.src("www/*")
		.pipe(clean())
})

gulp.task("move", ["removePrevious"], function(){
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
	    .pipe(minify({
			ext: {
	            src:'.src.js',
	            min:'.js',
	        },
		}))
	    .pipe(gulp.dest('www'))
})

gulp.task("minifyHTML", ["minifyJS"], function(){
	return gulp
		.src('www/**/*.html')
	    .pipe(htmlmin({collapseWhitespace: true}))
	    .pipe(gulp.dest('www'))
})

gulp.task("hash", ["minifyHTML"],  function(){
	return gulp
		.src(["www/**/*.*", "!www/**/*.src.js"])
		.pipe(hashsum({
			dest: "www",
			json: true,
			filename: "assets.json"
		}));
})

gulp.task("default", ["hash"], async function(){

})
