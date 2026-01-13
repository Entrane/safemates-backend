<?php
/**
 * Endpoint /api/friends/send
 * Envoyer une demande d'ami
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
$receiverUsername = $input['receiverUsername'] ?? null;

// Log pour debug
error_log("Friend request - userId: $userId, friendId: " . ($friendId ?? 'null') . ", receiverUsername: " . ($receiverUsername ?? 'null'));

// Accepter soit friend_id soit receiverUsername
if (!$friendId && !$receiverUsername) {
    sendJSON(['error' => 'ID ami ou pseudo manquant'], 400);
}

try {
    $db = getDB();

    // Si on a un username, convertir en ID
    if ($receiverUsername && !$friendId) {
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$receiverUsername]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            sendJSON(['error' => 'Utilisateur non trouvé'], 404);
        }
        $friendId = $user['id'];
    } else {
        // Vérifier que l'ami existe par ID
        $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$friendId]);
        if (!$stmt->fetch()) {
            sendJSON(['error' => 'Utilisateur non trouvé'], 404);
        }
    }

    // Empêcher de s'ajouter soi-même en ami
    if ($friendId == $userId) {
        sendJSON(['error' => 'Tu ne peux pas t\'ajouter toi-même en ami'], 400);
    }

    // Vérifier qu'il n'y a pas déjà une relation
    $stmt = $db->prepare("
        SELECT id FROM friendships
        WHERE (user_id = ? AND friend_id = ?)
        OR (user_id = ? AND friend_id = ?)
    ");
    $stmt->execute([$userId, $friendId, $friendId, $userId]);
    if ($stmt->fetch()) {
        sendJSON(['error' => 'Demande déjà existante'], 400);
    }

    // Créer la demande
    $stmt = $db->prepare("
        INSERT INTO friendships (user_id, friend_id, status, created_at)
        VALUES (?, ?, 'pending', NOW())
    ");
    $stmt->execute([$userId, $friendId]);

    sendJSON(['success' => true, 'message' => 'Demande envoyée']);

} catch (PDOException $e) {
    error_log("Erreur SQL /api/friends/send: " . $e->getMessage());
    error_log("SQL State: " . $e->getCode());
    error_log("Stack trace: " . $e->getTraceAsString());

    // En mode debug, retourner le message d'erreur SQL
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        sendJSON(['error' => 'Erreur SQL: ' . $e->getMessage()], 500);
    } else {
        sendJSON(['error' => 'Erreur lors de l\'ajout en ami'], 500);
    }
} catch (Exception $e) {
    error_log("Erreur /api/friends/send: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendJSON(['error' => 'Erreur serveur: ' . $e->getMessage()], 500);
}
?>
