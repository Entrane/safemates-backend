<?php
/**
 * Endpoint /api/friends
 * Gestion des amis et demandes d'ami
 */

require_once __DIR__ . '/config.php';

// Vérifier l'authentification (session OU token JWT)
$authUser = requireAuth();
$userId = $authUser['userId'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = getDB();

    if ($method === 'GET') {
        // Récupérer la liste des amis et demandes

        // Amis acceptés
        $stmt = $db->prepare("
            SELECT
                u.id,
                u.username,
                up.avatar_url,
                'accepted' as status
            FROM friendships f
            JOIN users u ON (
                CASE
                    WHEN f.user_id = ? THEN f.friend_id = u.id
                    ELSE f.user_id = u.id
                END
            )
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE (f.user_id = ? OR f.friend_id = ?)
            AND f.status = 'accepted'
        ");
        $stmt->execute([$userId, $userId, $userId]);
        $friends = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Demandes envoyées
        $stmt = $db->prepare("
            SELECT
                u.id,
                u.username,
                up.avatar_url,
                'pending_sent' as status
            FROM friendships f
            JOIN users u ON f.friend_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE f.user_id = ? AND f.status = 'pending'
        ");
        $stmt->execute([$userId]);
        $sentRequests = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Demandes reçues
        $stmt = $db->prepare("
            SELECT
                u.id,
                u.username,
                up.avatar_url,
                'pending_received' as status
            FROM friendships f
            JOIN users u ON f.user_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE f.friend_id = ? AND f.status = 'pending'
        ");
        $stmt->execute([$userId]);
        $receivedRequests = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Ajouter aussi le currentUser pour afficher le nom dans la sidebar
        $stmtUser = $db->prepare("SELECT username FROM users WHERE id = ?");
        $stmtUser->execute([$userId]);
        $currentUser = $stmtUser->fetch(PDO::FETCH_ASSOC);

        sendJSON([
            'currentUser' => $currentUser,
            'friends' => $friends,
            'outgoingRequests' => $sentRequests,
            'incomingRequests' => $receivedRequests
        ]);
    }

} catch (Exception $e) {
    error_log("Erreur /api/friends: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
