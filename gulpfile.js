gulp.task("move", function(){
	return gulp
		.src(["src/**/*.js", "src/**/*.css", "src/**/*.html"])
		.dest("www")
})

gulp.task("minifyCSS", function(){

})

gulp.task("minifyJS", function(){

})

gulp.task("minifyHTML", function(){

})

gulp.task("hash")

gulp.task("default", ["hash"] async function(){

})
