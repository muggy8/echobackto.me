const gulp = require('gulp')
const minify = require('gulp-minify')
const cleanCSS = require('gulp-clean-css')
const htmlmin = require('gulp-htmlmin')
const hashsum = require('gulp-hashsum')
const clean = require('gulp-clean')
const replace = require('gulp-replace')
const fs = require('promise-fs')

gulp.task("removePrevious", function(){
	return gulp
		.src("docs/*")
		.pipe(clean())
})

gulp.task("move", ["removePrevious"], function(){
	return gulp
		.src([
			"src/**/*.js",
			"src/**/*.mem",
			"src/**/*.c",
			"src/**/*.css",
			"src/**/*.html",
			"src/**/*.json",
			"src/**/*.png",
			"src/**/*.ico",
		])
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
		.src([
			'docs/**/*.js',
		])
	    .pipe(minify({
			ext: {
	            src:'.src.js',
	            min:'.js',
	        },
		}))
	    .pipe(gulp.dest('docs'))
})

gulp.task("changeToDeploymentAssets", ["minifyJS"], function(){
	return gulp
		.src("docs/index.html")
		.pipe(replace(".development.js", ".production.min.js"))
		.pipe(gulp.dest('docs'))
})

gulp.task("minifyHTML", ["changeToDeploymentAssets"], function(){
	return gulp
		.src('docs/**/*.html')
	    .pipe(htmlmin({collapseWhitespace: true}))
	    .pipe(gulp.dest('docs'))
})


gulp.task("hash", ["minifyHTML"],  function(){
	return gulp
		.src([
			"docs/**/*.*",
			"!docs/**/*.src.js",
			"!docs/**/*.sw.js",
			"!docs/**/assets.json",
		])
		.pipe(hashsum({
			dest: "docs",
			json: true,
			filename: "assets.json"
		}));
})

gulp.task("default", ["hash"], async function(){
	// now we do clean up stuff
	let compiledAssets = await fs.readFile("docs/assets.json")
	compiledAssets = JSON.parse(compiledAssets)
	let packageJson = await fs.readFile("package.json")
	packageJson = JSON.parse(packageJson)
	compiledAssets["/"] = compiledAssets["index.html"]

	Object.assign(compiledAssets, packageJson.cdn)
	return fs.writeFile("docs/assets.json", JSON.stringify(compiledAssets))
})
