<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: text/plain');

echo "=== TEST INSERT MESSAGE ===\n\n";

// Config DB
define('DB_HOST', 'localhost');
define('DB_NAME', 'u639530603_SafeMates');
define('DB_USER', 'u639530603_Entrane');
define('DB_PASS', 'En70frevaern@');

try {
    echo "1. Connexion DB...\n";
    $db = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Connecté\n\n";

    // Test avec IDs en dur (testuser2 = id 2, testuser1 = id 1 probablement)
    $senderId = 2;
    $recipientId = 1;
    $content = "Test message PHP " . date('H:i:s');

    echo "2. Insertion message...\n";
    echo "   Sender: $senderId\n";
    echo "   Recipient: $recipientId\n";
    echo "   Content: $content\n\n";

    $stmt = $db->prepare("
        INSERT INTO messages (sender_id, recipient_id, message, sent_at)
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$senderId, $recipientId, $content]);

    $messageId = $db->lastInsertId();
    echo "✓ Message inséré, ID: $messageId\n\n";

    echo "3. Récupération du message...\n";
    $stmt = $db->prepare("
        SELECT m.id, m.sender_id, m.recipient_id, m.message, m.sent_at,
               u.username as sender_username
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.id = ?
    ");
    $stmt->execute([$messageId]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "✓ Message récupéré:\n";
    print_r($message);

    echo "\n\n4. Format JSON:\n";
    echo json_encode($message, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo "\n✗ ERREUR:\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Fichier: " . $e->getFile() . "\n";
    echo "Ligne: " . $e->getLine() . "\n";
}
?>
