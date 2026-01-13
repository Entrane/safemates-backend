<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'message' => 'PHP fonctionne sans config.php',
    'php_version' => phpversion(),
    'time' => date('Y-m-d H:i:s')
]);
?>
