<?php
/**
 * Endpoint /api/friends/send
 * Envoyer une demande d'ami
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

if (!$friendId) {
    sendJSON(['error' => 'ID ami manquant'], 400);
}

try {
    $db = getDB();

    // Vérifier que l'ami existe
    $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$friendId]);
    if (!$stmt->fetch()) {
        sendJSON(['error' => 'Utilisateur non trouvé'], 404);
    }

    // Vérifier qu'il n'y a pas déjà une relation
    $stmt = $db->prepare("
        SELECT id FROM friendships
        WHERE (user_id = ? AND friend_id = ?)
        OR (user_id = ? AND friend_id = ?)
    ");
    $stmt->execute([$_SESSION['user_id'], $friendId, $friendId, $_SESSION['user_id']]);
    if ($stmt->fetch()) {
        sendJSON(['error' => 'Demande déjà existante'], 400);
    }

    // Créer la demande
    $stmt = $db->prepare("
        INSERT INTO friendships (user_id, friend_id, status, created_at)
        VALUES (?, ?, 'pending', NOW())
    ");
    $stmt->execute([$_SESSION['user_id'], $friendId]);

    sendJSON(['success' => true, 'message' => 'Demande envoyée']);

} catch (Exception $e) {
    error_log("Erreur /api/friends/send: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
