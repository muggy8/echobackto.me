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

	file_put_contents(dirname(__FILE__) . "/index.js", $js);

	minifyJS([dirname(__FILE__) . "/index.js" => dirname(__FILE__) . "/index.html"]);

	echo $js;
?>
