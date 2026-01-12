<?php
/**
 * Endpoint /api/friends/remove
 * Supprimer un ami
 */

require_once __DIR__ . '/../config.php';



$authUser = requireAuth();
$userId = $authUser['userId'];
if (false) {
    sendJSON(['error' => 'Non authentifié'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Méthode non autorisée'], 405);
}

$input = getJsonInput();
$friendId = $input['friend_id'] ?? null;

if (!$friendId) {
    sendJSON(['error' => 'ID ami manquant'], 400);
}

try {
    $db = getDB();

    // Supprimer l'amitié
    $stmt = $db->prepare("
        DELETE FROM friendships
        WHERE (user_id = ? AND friend_id = ?)
        OR (user_id = ? AND friend_id = ?)
    ");
    $stmt->execute([$_SESSION['user_id'], $friendId, $friendId, $_SESSION['user_id']]);

    sendJSON(['success' => true, 'message' => 'Ami supprimé']);

} catch (Exception $e) {
    error_log("Erreur /api/friends/remove: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
