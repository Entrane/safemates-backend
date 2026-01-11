<?php
/**
 * Endpoint /api/friends/respond
 * Accepter ou refuser une demande d'ami
 */

require_once __DIR__ . '/../config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Non authentifié'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Méthode non autorisée'], 405);
}

$input = getJsonInput();
$friendId = $input['friend_id'] ?? null;
$action = $input['action'] ?? null; // 'accept' ou 'reject'

if (!$friendId || !$action) {
    sendJSON(['error' => 'Paramètres manquants'], 400);
}

try {
    $db = getDB();

    if ($action === 'accept') {
        // Accepter la demande
        $stmt = $db->prepare("
            UPDATE friendships
            SET status = 'accepted', updated_at = NOW()
            WHERE user_id = ? AND friend_id = ? AND status = 'pending'
        ");
        $stmt->execute([$friendId, $_SESSION['user_id']]);

        sendJSON(['success' => true, 'message' => 'Demande acceptée']);

    } elseif ($action === 'reject') {
        // Refuser la demande
        $stmt = $db->prepare("
            DELETE FROM friendships
            WHERE user_id = ? AND friend_id = ? AND status = 'pending'
        ");
        $stmt->execute([$friendId, $_SESSION['user_id']]);

        sendJSON(['success' => true, 'message' => 'Demande refusée']);
    } else {
        sendJSON(['error' => 'Action invalide'], 400);
    }

} catch (Exception $e) {
    error_log("Erreur /api/friends/respond: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
