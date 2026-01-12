<?php
/**
 * Script de debug pour vérifier les données reçues
 */

header('Content-Type: application/json');

$rawInput = file_get_contents('php://input');
$jsonDecoded = json_decode($rawInput, true);

$debug = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'non défini',
    'raw_input' => $rawInput,
    'raw_input_length' => strlen($rawInput),
    'json_decoded' => $jsonDecoded,
    'json_last_error' => json_last_error(),
    'json_last_error_msg' => json_last_error_msg(),
    'POST' => $_POST,
    'GET' => $_GET
];

echo json_encode($debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
