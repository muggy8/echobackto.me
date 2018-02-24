<?php
	function sanitize_output($buffer) {
		global $localAssetVersion;
		global $imageVersioning;
		global $htRoot;
		global $cacheResponce;
		$search = array(
			'!/\*[^*]*\*+([^/][^*]*\*+)*/!', // strip CSS comments if there's any in line
			'/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\')\/\/.*))/', // remove js comments first
			'/<!--(.*)-->/Uis',   // strip html comments
			'/([ \t]|\n)/',       // remove tabs or new line
			'/\>[^\S ]+/s',  // strip whitespaces after tags, except space
			'/[^\S ]+\</s',  // strip whitespaces before tags, except space
			'/(\s)+/s',       // shorten multiple whitespace sequences
			'/\{htRoot\}/i'
		);
		$replace = array(
			'',
			'',
			' ',
			' ',
			'>',
			'<',
			'\\1',
			$htRoot
		);
		$buffer = preg_replace($search, $replace, $buffer);
		$buffer = str_replace('> <', '><', $buffer);

		// add version to image assets
		if ($imageVersioning){

			$buffer = preg_replace_callback('/(\<(img|source")(.|\n)+\>|style=(\".+\"|\'.+\'))/U', function($imgTag) use ($localAssetVersion, $imageVersioning){ //regex: find all instances of img tag, src tag and style= attribute

				$imgTag[0] = preg_replace_callback('/(?<=(src=\"|src=\'|url\(\"|url\(\'))http.+(?=(\'|\"))/U', function($assetLink)use ($localAssetVersion, $imageVersioning){//regex to find the url segment starting with 'http://' or 'https://' that comes after a(n) src=", src=', url(" or url('
					if (preg_match('/\?/i', $assetLink[0])){ // has "?"
						return $assetLink[0]."&v=$localAssetVersion";
					}
					else{
						return $assetLink[0]."?v=$localAssetVersion";
					}
				}, $imgTag[0]);
				return $imgTag[0];

			}, $buffer);

		}

		if ($cacheResponce){
			$thisFileName = basename($_SERVER['SCRIPT_NAME'], ".php" );
			$pathName = pathinfo($_SERVER['SCRIPT_FILENAME']);
			$pathName = $pathName['dirname'];

			if (!file_put_contents("$pathName/$thisFileName.html", $buffer)){
				$buffer .= "error trying to cache page. Please check directory permissions";
			}
		}
		return $buffer;
	}

	ob_start();

?><!DOCTYPE html>
<html>
	<head>
		<style>
			<?=file_get_contents("css/critical.min.css")?>
		</style>
		<title>Echo Back to Me</title>
		<meta name="description" content="Echo what you say back at you hands free.">
		<meta name="viewport" content="width=device-width, initial-scale=1. minimum-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no">
		<meta charset="UTF-8">
		<meta name="keywords" content="Echo, App">
		<meta content="telephone=no" name="format-detection">
		<meta name="SKYPE_TOOLBAR" content="SKYPE_TOOLBAR_PARSER_COMPATIBLE">
		<meta name="msapplication-tap-highlight" content="no">
		<meta name="copyright" content="&copy; 2018 Muggy Ate ">
		<meta name="author" content="Muggy Ate">
		<link rel="author" href="https://plus.google.com/+muggyate">

		<link rel="manifest" href="manifest/manifest.json">

		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="application-name" content="Echo Back To Me">
		<meta name="apple-mobile-web-app-title" content="Echo Back To Me">
		<meta name="theme-color" content="#DDD">
		<meta name="msapplication-navbutton-color" content="#DDD">
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
		<meta name="msapplication-starturl" content="/">

		<link rel="icon" type="image/png" sizes="512x512" href="/manifest/512.png">
		<link rel="apple-touch-icon" type="image/png" sizes="512x512" href="/manifest/512.png">

		<link rel="icon" type="image/png" sizes="256x256" href="/manifest/256.png">
		<link rel="apple-touch-icon" type="image/png" sizes="256x256" href="/manifest/256.png">

		<link rel="icon" type="image/png" sizes="192x192" href="/manifest/192.png">
		<link rel="apple-touch-icon" type="image/png" sizes="192x192" href="/manifest/192.png">

		<link rel="icon" type="image/png" sizes="168x168" href="/manifest/168.png">
		<link rel="apple-touch-icon" type="image/png" sizes="168x168" href="/manifest/168.png">

		<link rel="icon" type="image/png" sizes="152x152" href="/manifest/152.png">
		<link rel="apple-touch-icon" type="image/png" sizes="152x152" href="/manifest/152.png">

		<link rel="icon" type="image/png" sizes="144x144" href="/manifest/144.png">
		<link rel="apple-touch-icon" type="image/png" sizes="144x144" href="/manifest/144.png">

		<link rel="icon" type="image/png" sizes="128x128" href="/manifest/128.png">
		<link rel="apple-touch-icon" type="image/png" sizes="128x128" href="/manifest/128.png">

		<link rel="icon" type="image/png" sizes="96x96" href="/manifest/96.png">
		<link rel="apple-touch-icon" type="image/png" sizes="96x96" href="/manifest/96.png">

		<link rel="icon" type="image/png" sizes="72x72" href="/manifest/72.png">
		<link rel="apple-touch-icon" type="image/png" sizes="72x72" href="/manifest/72.png">

		<link rel="icon" type="image/png" sizes="64x64" href="/manifest/64.png">
		<link rel="apple-touch-icon" type="image/png" sizes="64x64" href="/manifest/64.png">

		<link rel="icon" type="image/png" sizes="48x48" href="/manifest/48.png">
		<link rel="apple-touch-icon" type="image/png" sizes="48x48" href="/manifest/48.png">

		<link rel="icon" type="image/png" sizes="32x32" href="/manifest/32.png">
		<link rel="apple-touch-icon" type="image/png" sizes="32x32" href="/manifest/32.png">
	</head>

	<body>
		<script>
		  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

		  ga('create', 'UA-90703111-1', 'auto');
		  ga('send', 'pageview');

		</script>

		<main>
			<h1>Echo Back to Me</h1>
			<nav>
				<a href="#" class="app viewing loading-cloak" target="recordings-tab">App</a>
				<a href="#" class="about loading-cloak" target="about-tab">About</a>
				<div class="loading-spinner"></div>
			</nav>
			<div id="recordings-tab" class="tab-body viewing loading-cloak">
				<div class="app-tools">
					<div class="hidden">
						<label for="sensitivity">Sensitivity: (should be between 0 and 0.4)</label>
						<input id="sensitivity" class="strech" type="number" pattern="[0-9]+([\.,][0-9]+)?" step="0.001" max="1" min="0">
						<button id="sensitivity-update" type="button">Update</button>
					</div>
					<button id="lone-btn">Calibrate and Begin</button>
				</div>
				<ul id="recordings"></ul>
				<p class="mobile-notice">Notice: If you are on a mobile browser, this app WILL break. See About for workaround.</p>
			</div>
			<div id="about-tab" class="tab-body loading-cloak">
				<p>Echo Back to Me is a web application that echos what you say back at you hands free. For best results, please use with headphones. For mobile users, please read the workaround below.</p>

				<p><strong>Usage:</strong> You first need to calibrate your the app to your surounding enviroment so it can automatically turn on and off the listener. During this process, you should be as quiet as you can and let the recording only detect your ambiant surounding noise. Once that's done, you can toggle listening mode on and off.</p>

				<p>If calibration results in a sensitivity that's beyond 0.4, it's likely that your enviroment is either really loud or that you made a sound somwhere during the calibration process (dropped a pen maybe?). If this is the case, just refresh the page and try again (or adjust manually).</p>

				<p><strong>Mobile Workaround 1:</strong> Use Firefox for Android (I would immagine same for iOS) as they allow autoplay for media content by default and has an easy and conveniet setting that you can access to toggle this on and off.</p>

				<p><strong>Mobile Workaround 2:</strong> To protect users from unwanted data charges, mobile browsers require you to interact with a media source to play it's contents (aka audio and video) so if a video or audio attempts to auto play in a page, it wont be allowed to on mobile and hence protecting you from potential unwanted data charges. Echo Back to Me doesn't load media assets off the net and as a result doesn't have that problem however this sitll applies to the audio element that is used. to get around this you must be using a stable version of mobile Chrome that's version 47 or later (just update your chrome from the appstore / google play unless you're on a really old device). You must then allow chrome to autoplay media by setting "disable-gesture-requirement-for-media-playback" to "enabled". it is strongly recomended that you re-disable "disable-gesture-requirement-for-media-playback" when you're done using this app for your safety.</p>

				<p>To enable this work around, visit <strong>chrome://flags/#disable-gesture-requirement-for-media-playback</strong> and click on the enable button.</p>

				<p>This app is built upon <a href="https://github.com/chris-rudmin/Recorderjs">Chris Rudmin's fork of Recorderjs</a> (<a href="https://github.com/mattdiamond/Recorderjs" target="_blank">Originally by Matt Diamond</a>) so special thanks to both of these people for their hardwork in making this possiable. And special thanks to <a href="https://github.com/dwighthouse/onfontready" target="_blank">swighthouse's onfontready</a> because small optimizations things makes big differences.</p>

				<p>Additionally, Special thanks to <a href="https://javascript-minifier.com/" target="_blank">https://javascript-minifier.com/</a> and <a href="https://github.com/promatik/PHP-JS-CSS-Minifier">Toni Almeida's PHP, JS and CSS Minifier</a> for making the application compression possiable</p>
			</div>
		</main>

		<noscript id="slow-css">
			<link rel="stylesheet" href="./css/styles.css">
		</noscript>
		<script id="inline-scripts">
			// on font ready
			window.onfontready=function(e,t,i,n,o){i=i||0,i.timeoutAfter&&setTimeout(function(){n&&(document.body.removeChild(n),n=0,i.onTimeout&&i.onTimeout())},i.timeoutAfter),o=function(){n&&n.firstChild.clientWidth==n.lastChild.clientWidth&&(document.body.removeChild(n),n=0,t())},o(document.body.appendChild(n=document.createElement("div")).innerHTML='<div style="position:fixed;white-space:pre;bottom:999%;right:999%;font:999px '+(i.generic?"":"'")+e+(i.generic?"":"'")+',serif">'+(i.sampleText||" ")+'</div><div style="position:fixed;white-space:pre;bottom:999%;right:999%;font:999px '+(i.generic?"":"'")+e+(i.generic?"":"'")+',monospace">'+(i.sampleText||" ")+"</div>"),n&&(n.firstChild.appendChild(e=document.createElement("iframe")).style.width="999%",e.contentWindow.onresize=o,n.lastChild.appendChild(e=document.createElement("iframe")).style.width="999%",e.contentWindow.onresize=o,e=setTimeout(o))};

			// on font ready event listener for open sans
			onfontready("Open Sans", function(){document.documentElement.className+=" open-sans";},{timeoutAfter:5000, onTimeout:function(){document.documentElement.className+=" no-open-sans"}});

			// lazy load slow CSS
			var loadDeferredStyles = function() {
				var addStylesNode = document.getElementById("slow-css");
				document.body.appendChild(document.createElement("div")).innerHTML = addStylesNode.textContent;
				addStylesNode.parentElement.removeChild(addStylesNode);
			};
			document.addEventListener("DOMContentLoaded", loadDeferredStyles);
		</script>
		<!--<script src="./js/getUserMedia.min.js"></script>
		<script src="./js/audiocontext-polyfill.js"></script>
		<script src="./js/do-async.js"></script>
		<script src="./js/json-css.min.js"></script>
		<script src="./js/recorder/recorder.min.js"></script>
		<script src="./js/app.js"></script>-->

		<!-- script to boot the whole app -->
		<script src="./js/" type="text/javascript"></script>
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">
	</body>
</html><?php
	$html = sanitize_output(ob_get_clean());

	file_put_contents("index.html", $html);
	echo $html;
?>
