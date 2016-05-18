<?php

//$fileName = $_POST['fileNameData'];
//$htmlToSave = $_POST['htmlToSaveData'];

$fileName = $argv[1];
$htmlImport = $argv[2];

$htmlToSave = (string)$htmlImport;

$myFile = fopen($fileName, "w") or die('You do not have write permissions');

fwrite($myFile, $htmlToSave);
fclose($myFile);

?>