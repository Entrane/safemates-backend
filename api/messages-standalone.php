<?php
/**
 * Messages API - Version autonome sans config.php
 */

// Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Charger configuration depuis config.php
require_once __DIR__ . '/config.php';

// Connexion DB
try {
    $db = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit;
}

// Fonction pour obtenir le token
function getToken() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];

    if (isset($headers['Authorization']) && preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $m)) {
        return $m[1];
    }

    if (isset($_SERVER['HTTP_AUTHORIZATION']) && preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $m)) {
        return $m[1];
    }

    return null;
}

// Fonction pour vérifier le token
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

// Auth
$token = getToken();
$user = verifyJWT($token);

if (!$user || !isset($user['userId'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non authentifié']);
    exit;
}

$userId = $user['userId'];

// POST - Envoyer un message
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $toUsername = $input['toUsername'] ?? null;
    $content = $input['content'] ?? null;

    if (!$toUsername || !$content) {
        http_response_code(400);
        echo json_encode(['error' => 'Paramètres manquants']);
        exit;
    }

    try {
        // ID destinataire
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$toUsername]);
        $toUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$toUser) {
            http_response_code(404);
            echo json_encode(['error' => 'Utilisateur non trouvé']);
            exit;
        }

        $toUserId = $toUser['id'];

        // Vérifier amitié
        $stmt = $db->prepare("
            SELECT COUNT(*) as count FROM friendships
            WHERE status = 'accepted'
            AND ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
        ");
        $stmt->execute([$userId, $toUserId, $toUserId, $userId]);
        $friendship = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($friendship['count'] == 0) {
            http_response_code(403);
            echo json_encode(['error' => 'Vous devez être amis']);
            exit;
        }

        // Insérer message
        $stmt = $db->prepare("
            INSERT INTO messages (sender_id, recipient_id, message, sent_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$userId, $toUserId, $content]);

        $messageId = $db->lastInsertId();

        // Récupérer le message
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

        echo json_encode($message);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
    }
}

// GET - Récupérer messages
elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $withUsername = $_GET['with'] ?? null;

    if (!$withUsername) {
        http_response_code(400);
        echo json_encode(['error' => 'Paramètre "with" manquant']);
        exit;
    }

    try {
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$withUsername]);
        $friend = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$friend) {
            http_response_code(404);
            echo json_encode(['error' => 'Utilisateur non trouvé']);
            exit;
        }

        $friendId = $friend['id'];

        $stmt = $db->prepare("
            SELECT m.id, m.sender_id as from_user_id, m.recipient_id as to_user_id,
                   m.message as content, m.sent_at as created_at,
                   u1.username as from_username,
                   u2.username as to_username
            FROM messages m
            JOIN users u1 ON u1.id = m.sender_id
            JOIN users u2 ON u2.id = m.recipient_id
            WHERE (m.sender_id = ? AND m.recipient_id = ?)
               OR (m.sender_id = ? AND m.recipient_id = ?)
            ORDER BY m.sent_at ASC
        ");
        $stmt->execute([$userId, $friendId, $friendId, $userId]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($messages);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
    }
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}
?>
