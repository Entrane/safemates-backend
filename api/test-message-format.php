<?php
header('Content-Type: application/json');

// Config DB
define('DB_HOST', 'localhost');
define('DB_NAME', 'u639530603_SafeMates');
define('DB_USER', 'u639530603_Entrane');
define('DB_PASS', 'En70frevaern@');
define('JWT_SECRET', 'VotreSecretJWTTresSecurise123!@#');

$db = new PDO(
    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
    DB_USER,
    DB_PASS
);

// Fonction token
function getToken() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    if (isset($headers['Authorization']) && preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $m)) {
        return $m[1];
    }
    return null;
}

function verifyJWT($token) {
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($header, $payload, $signature) = $parts;
    $expectedSig = hash_hmac('sha256', "$header.$payload", JWT_SECRET);
    if ($signature !== $expectedSig) return null;
    $data = json_decode(base64_decode($payload), true);
    if (isset($data['exp']) && $data['exp'] < time()) return null;
    return $data;
}

$token = getToken();
$user = verifyJWT($token);

if (!$user) {
    echo json_encode(['error' => 'Non authentifié', 'token_received' => $token ? 'yes' : 'no']);
    exit;
}

// Insertion test
$stmt = $db->prepare("INSERT INTO messages (sender_id, recipient_id, message, sent_at) VALUES (?, ?, ?, NOW())");
$stmt->execute([$user['userId'], 1, 'Test via API ' . date('H:i:s')]);
$messageId = $db->lastInsertId();

// Récupération avec le format exact
$stmt = $db->prepare("
    SELECT m.id, m.sender_id as from_user_id, m.recipient_id as to_user_id,
           m.message as content, m.sent_at as created_at,
           u1.username as from_username,
           u2.username as to_username
    FROM messages m
    JOIN users u1 ON u1.id = m.sender_id
    JOIN users u2 ON u2.id = m.recipient_id
    WHERE m.id = ?
");
$stmt->execute([$messageId]);
$message = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    'success' => true,
    'user' => $user,
    'message_inserted' => $messageId,
    'message_data' => $message
], JSON_PRETTY_PRINT);
?>
