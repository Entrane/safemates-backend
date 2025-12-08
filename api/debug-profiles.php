<?php
/**
 * Fichier de debug pour voir les profils dans la base de données
 * À SUPPRIMER après débogage
 */

require_once 'config.php';

// Vérifier l'authentification
$user = requireAuth();

try {
    $db = getDB();

    // Récupérer TOUS les profils
    $stmt = $db->prepare("
        SELECT
            u.id as user_id,
            u.username,
            gp.game,
            gp.rank,
            gp.mode,
            gp.tolerance
        FROM game_profiles gp
        JOIN users u ON gp.user_id = u.id
        ORDER BY gp.game, u.username
    ");
    $stmt->execute();
    $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Récupérer mon profil
    $stmt = $db->prepare("
        SELECT game, rank, mode, tolerance
        FROM game_profiles
        WHERE user_id = ?
    ");
    $stmt->execute([$user['userId']]);
    $myProfiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendJSON([
        'success' => true,
        'myUserId' => $user['userId'],
        'myProfiles' => $myProfiles,
        'allProfiles' => $profiles
    ], 200);

} catch (PDOException $e) {
    error_log("Erreur debug profiles: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de la récupération des profils', 'details' => $e->getMessage()], 500);
}
?>
