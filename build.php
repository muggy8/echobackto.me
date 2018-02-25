<?php
	foreach(scandir("version") as $versionFile){
		if ($versionFile !== "." || $versionFile !== ".."){
			unlink("version/" . $versionFile);
		}
	}

	ob_start();

	include(dirname(__FILE__) . "/index.php");

	include(dirname(__FILE__) . "/js/index.php");

	ob_get_clean();

	function hashDirectory($directory){
	    if (!is_dir($directory)){
	        return false;
	    }

		$hashVal = array();

		foreach(scandir($directory) as &$subFile){
			if ($subFile == "." || $subFile == ".."){
				continue;
			}
			$targetFile = $directory . "/" . $subFile;
			$subFolderHash = hashDirectory($targetFile);
			// the above will return false if it's not a folder so we can hash it as a file if the above fails
			if (!$subFolderHash){
				$subFolderHash = hash_file("sha256", $targetFile);
			}
			$hashVal[] = $subFolderHash;
		}

		return hash("sha256", implode('', $hashVal));
	}

	echo $currentVersion = hashDirectory(".");
	file_put_contents("version/$currentVersion", "");
