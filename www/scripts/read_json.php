<?php

$file = $_GET['id'].".json";
if(file_exists($file))
	echo file_get_contents($file);
else echo 'ERROR';

?>