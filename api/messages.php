<?php
/**
 * Endpoint /api/messages
 * Gestion des messages entre amis
 */

require_once __DIR__ . '/config.php';

$authUser = requireAuth();
$userId = $authUser['userId'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Envoyer un message
    $input = getJsonInput();
    $toUsername = $input['toUsername'] ?? null;
    $content = $input['content'] ?? null;

    if (!$toUsername || !$content) {
        sendJSON(['error' => 'Paramètres manquants'], 400);
    }

    try {
        $db = getDB();

        // Récupérer l'ID du destinataire
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$toUsername]);
        $toUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$toUser) {
            sendJSON(['error' => 'Utilisateur non trouvé'], 404);
        }

        $toUserId = $toUser['id'];

        // Vérifier que les deux utilisateurs sont amis
        $stmt = $db->prepare("
            SELECT COUNT(*) as count FROM friendships
            WHERE status = 'accepted'
            AND ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
        ");
        $stmt->execute([$userId, $toUserId, $toUserId, $userId]);
        $friendship = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($friendship['count'] == 0) {
            sendJSON(['error' => 'Vous devez être amis pour envoyer des messages'], 403);
        }

        // Insérer le message
        $stmt = $db->prepare("
            INSERT INTO messages (from_user_id, to_user_id, content, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$userId, $toUserId, $content]);

        $messageId = $db->lastInsertId();

        // Récupérer le message créé avec le username
        $stmt = $db->prepare("
            SELECT m.id, m.from_user_id, m.to_user_id, m.content, m.created_at,
                   u.username as from_username
            FROM messages m
            JOIN users u ON u.id = m.from_user_id
            WHERE m.id = ?
        ");
        $stmt->execute([$messageId]);
        $message = $stmt->fetch(PDO::FETCH_ASSOC);

        sendJSON($message);

    } catch (Exception $e) {
        error_log("Erreur /api/messages POST: " . $e->getMessage());
        sendJSON(['error' => 'Erreur serveur'], 500);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Récupérer les messages avec un ami
    $withUsername = $_GET['with'] ?? null;

    if (!$withUsername) {
        sendJSON(['error' => 'Paramètre "with" manquant'], 400);
    }

    try {
        $db = getDB();

        // Récupérer l'ID de l'ami
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$withUsername]);
        $friend = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$friend) {
            sendJSON(['error' => 'Utilisateur non trouvé'], 404);
        }

        $friendId = $friend['id'];

        // Récupérer les messages
        $stmt = $db->prepare("
            SELECT m.id, m.from_user_id, m.to_user_id, m.content, m.created_at,
                   u.username as from_username
            FROM messages m
            JOIN users u ON u.id = m.from_user_id
            WHERE (m.from_user_id = ? AND m.to_user_id = ?)
               OR (m.from_user_id = ? AND m.to_user_id = ?)
            ORDER BY m.created_at ASC
        ");
        $stmt->execute([$userId, $friendId, $friendId, $userId]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendJSON($messages);

    } catch (Exception $e) {
        error_log("Erreur /api/messages GET: " . $e->getMessage());
        sendJSON(['error' => 'Erreur serveur'], 500);
    }

} else {
    sendJSON(['error' => 'Méthode non autorisée'], 405);
}
?>
