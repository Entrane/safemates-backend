<?php
// Test debug pour messages API
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TEST DEBUG MESSAGES API ===\n\n";

// Test 1: Config.php
echo "1. Test chargement config.php...\n";
try {
    require_once __DIR__ . '/config.php';
    echo "✓ Config chargé\n\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n\n";
    exit;
}

// Test 2: Connexion DB
echo "2. Test connexion DB...\n";
try {
    $db = getDB();
    echo "✓ Connexion DB OK\n\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n\n";
    exit;
}

// Test 3: Token
echo "3. Test récupération token...\n";
$token = getAuthToken();
if ($token) {
    echo "✓ Token trouvé: " . substr($token, 0, 20) . "...\n\n";
} else {
    echo "✗ Pas de token\n\n";
}

// Test 4: Vérification token
echo "4. Test vérification token...\n";
try {
    if ($token) {
        $userData = verifyToken($token);
        if ($userData) {
            echo "✓ Token valide\n";
            echo "  UserID: " . $userData['userId'] . "\n";
            echo "  Username: " . $userData['username'] . "\n\n";
        } else {
            echo "✗ Token invalide\n\n";
        }
    }
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n\n";
}

// Test 5: requireAuth
echo "5. Test requireAuth()...\n";
try {
    $authUser = requireAuth();
    echo "✓ Authentification OK\n";
    echo "  UserID: " . $authUser['userId'] . "\n";
    echo "  Username: " . ($authUser['username'] ?? 'N/A') . "\n\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n\n";
    exit;
}

// Test 6: Query utilisateur testuser1
echo "6. Test query utilisateur testuser1...\n";
try {
    $stmt = $db->prepare("SELECT id, username FROM users WHERE username = ?");
    $stmt->execute(['testuser1']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user) {
        echo "✓ Utilisateur trouvé\n";
        echo "  ID: " . $user['id'] . "\n";
        echo "  Username: " . $user['username'] . "\n\n";
    } else {
        echo "✗ Utilisateur non trouvé\n\n";
    }
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n\n";
}

// Test 7: Vérifier table messages
echo "7. Test table messages...\n";
try {
    $stmt = $db->query("SELECT COUNT(*) as count FROM messages");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✓ Table messages existe\n";
    echo "  Nombre de messages: " . $result['count'] . "\n\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n\n";
}

echo "=== FIN DES TESTS ===\n";
?>
