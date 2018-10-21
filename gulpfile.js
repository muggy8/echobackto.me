const gulp = require("gulp")
const minify = require('gulp-minify')
const cleanCSS = require('gulp-clean-css')
const htmlmin = require('gulp-htmlmin')
const hashsum = require("gulp-hashsum")
const clean = require('gulp-clean')
const replace = require('gulp-replace')

gulp.task("removePrevious", function(){
	return gulp
		.src("docs/*")
		.pipe(clean())
})

gulp.task("move", ["removePrevious"], function(){
	return gulp
		.src(["src/**/*.js", "src/**/*.css", "src/**/*.html"])
		.pipe(gulp.dest('docs'))
})

gulp.task("minifyCSS", ["move"], function(){
	return gulp
		.src('docs/**/*.css')
		.pipe(cleanCSS())
		.pipe(gulp.dest('docs'))
})

gulp.task("minifyJS", ["minifyCSS"], function(){
	return gulp
		.src('docs/**/*.js')
	    .pipe(minify({
			ext: {
	            src:'.src.js',
	            min:'.js',
	        },
		}))
	    .pipe(gulp.dest('docs'))
})

gulp.task("minifyHTML", ["minifyJS"], function(){
	return gulp
		.src('docs/**/*.html')
	    .pipe(htmlmin({collapseWhitespace: true}))
	    .pipe(gulp.dest('docs'))
})

gulp.task("deploymentAssets", ["minifyHTML"], function(){
	return gulp
		.src("index.html")
		.pipe(replace(".development.js", ".production.min.js"))
		.pipe(gulp.dest('docs'))
})

gulp.task("hash", ["deploymentAssets"],  function(){
	return gulp
		.src(["docs/**/*.*", "!docs/**/*.src.js"])
		.pipe(hashsum({
			dest: "docs",
			json: true,
			filename: "assets.json"
		}));
})

gulp.task("default", ["hash"], async function(){

})
