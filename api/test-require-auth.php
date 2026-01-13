<?php
echo "TEST 1: Start\n\n";

require_once __DIR__ . '/config.php';
echo "TEST 2: Config loaded\n\n";

echo "TEST 3: Calling requireAuth()...\n";

// requireAuth() va appeler sendJSON() qui fait exit
// Donc on ne verra jamais le TEST 4
$authUser = requireAuth();

echo "TEST 4: Auth successful\n";
echo "User ID: " . $authUser['userId'] . "\n";
?>
