<?php
// Test 1: Juste afficher quelque chose
echo "TEST 1: PHP works\n\n";

// Test 2: Afficher les headers reçus
echo "TEST 2: Headers:\n";
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    print_r($headers);
} else {
    echo "getallheaders() not available\n";
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            echo "$name = $value\n";
        }
    }
}

echo "\n\nTEST 3: Authorization header:\n";
echo "HTTP_AUTHORIZATION: " . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'not set') . "\n";

echo "\n\nTEST 4: Trying to load config...\n";
try {
    require_once __DIR__ . '/config.php';
    echo "SUCCESS: config loaded\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "FILE: " . $e->getFile() . "\n";
    echo "LINE: " . $e->getLine() . "\n";
}
?>
