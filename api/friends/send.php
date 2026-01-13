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

    $insertSuccess = $stmt->execute([$userId, $friendId]);

    if ($insertSuccess) {
        sendJSON(['success' => true, 'message' => 'Demande envoyée']);
    } else {
        $errorInfo = $stmt->errorInfo();
        error_log("Insert failed - SQL State: " . $errorInfo[0] . ", Error: " . $errorInfo[2]);
        sendJSON(['error' => 'Impossible d\'envoyer la demande'], 500);
    }

} catch (PDOException $e) {
    error_log("Erreur SQL /api/friends/send: " . $e->getMessage());
    error_log("SQL State: " . $e->getCode());
    error_log("Stack trace: " . $e->getTraceAsString());

    // Gérer les erreurs spécifiques
    $errorMessage = 'Erreur lors de l\'ajout en ami';

    // Contrainte de clé étrangère (utilisateur n'existe pas)
    if (strpos($e->getMessage(), '1452') !== false || strpos($e->getMessage(), 'foreign key constraint') !== false) {
        $errorMessage = 'Utilisateur introuvable';
        error_log("Foreign key constraint violation - user may not exist");
    }

    // Contrainte unique (demande déjà existante)
    if (strpos($e->getMessage(), '1062') !== false || strpos($e->getMessage(), 'Duplicate entry') !== false) {
        $errorMessage = 'Demande d\'ami déjà existante';
        error_log("Duplicate friendship entry");
    }

    sendJSON(['error' => $errorMessage], 500);
} catch (Exception $e) {
    error_log("Erreur /api/friends/send: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendJSON(['error' => 'Erreur serveur: ' . $e->getMessage()], 500);
}
?>
