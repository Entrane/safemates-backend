<?php
/**
 * Script de diagnostic pour vérifier les profils utilisateurs
 */

require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $db = getDB();

    // Récupérer tous les profils de jeu avec les infos utilisateur
    $stmt = $db->query("
        SELECT
            gp.id as profile_id,
            gp.user_id,
            u.username,
            gp.game,
            gp.rank,
            gp.mode,
            gp.tolerance,
            gp.preferred_ranks,
            gp.updated_at,
            us.last_activity
        FROM game_profiles gp
        JOIN users u ON gp.user_id = u.id
        LEFT JOIN user_sessions us ON u.id = us.user_id
        ORDER BY u.username, gp.game
    ");

    $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'total_profiles' => count($profiles),
        'profiles' => $profiles
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
