<?php
/**
 * Version simplifiée de messages.php pour debug
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/config.php';

    // Test 1: Vérifier que config est chargé
    echo json_encode(['step' => 1, 'message' => 'Config loaded']);
    exit;

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
    exit;
}
?>
