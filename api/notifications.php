<?php
/**
 * Endpoint /api/notifications
 * Récupérer les notifications de l'utilisateur
 */

require_once __DIR__ . '/config.php';

$authUser = requireAuth();
$userId = $authUser['userId'];

try {
    $db = getDB();

    // Récupérer les notifications non lues
    $stmt = $db->prepare("
        SELECT
            id,
            type,
            message,
            data,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    ");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Décoder les champs JSON
    foreach ($notifications as &$notif) {
        if ($notif['data']) {
            $notif['data'] = json_decode($notif['data'], true);
        }
        $notif['is_read'] = (bool)$notif['is_read'];
    }

    sendJSON(['notifications' => $notifications]);

} catch (Exception $e) {
    error_log("Erreur /api/notifications: " . $e->getMessage());

    // Si la table n'existe pas encore, retourner un tableau vide
    sendJSON(['notifications' => []]);
}
?>
