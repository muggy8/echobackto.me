<?php 
	// a set of js and css cleaner curtisy of https://github.com/promatik/PHP-JS-CSS-Minifier
	function minifyJS($arr){
		minify($arr, 'https://javascript-minifier.com/raw');
	}
	
	function minifyCSS($arr){
		minify($arr, 'https://cssminifier.com/raw');
	}
	
	function minify($arr, $url) {
		foreach ($arr as $key => $value) {
			$handler = fopen($value, 'w') or die("File <a href='" . $value . "'>" . $value . "</a> error!<br />");
			fwrite($handler, getMinified($url, file_get_contents($key)));
			fclose($handler);
			echo "File <a href='" . $value . "'>" . $value . "</a> done!<br />";
		}
	}
	
	function getMinified($url, $content) {
		$postdata = array('http' => array(
	        'method'  => 'POST',
	        'header'  => 'Content-type: application/x-www-form-urlencoded',
	        'content' => http_build_query( array('input' => $content) ) ) );
		return file_get_contents($url, false, stream_context_create($postdata));
	}
	
	ob_start();
	
	header("content-type: text/javascript");
	
	require_once("getUserMedia.min.js");
	
	require_once("audiocontext-polyfill.min.js");
	
	//require_once("do-async.min.js");
	
	//require_once("json-css.min.js");
	
	require_once("recorder/recorder.min.js");
	
	require_once("app.js");
	
	$js = ob_get_clean();
	
	ob_start();
	
	file_put_contents("index.js", $js);
	
	minifyJS(["index.js" => "index.html"]);
	
	ob_get_clean();
	
	echo file_get_contents("index.html");
?>