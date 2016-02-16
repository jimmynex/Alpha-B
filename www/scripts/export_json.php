<?php
$fp = fopen($_GET['id'].'.json', 'w');
fwrite($fp, file_get_contents('php://input'));
fclose($fp);
?>
