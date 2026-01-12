<?php
/**
 * Script pour supprimer un profil de jeu spécifique par ID
 * Usage: /api/delete-profile.php?profile_id=123
 */

require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET['profile_id'])) {
    echo json_encode(['error' => 'profile_id requis'], JSON_PRETTY_PRINT);
    exit;
}

$profileId = (int)$_GET['profile_id'];

try {
    $db = getDB();

    // Récupérer les infos du profil avant suppression
    $stmt = $db->prepare("
        SELECT gp.*, u.username
        FROM game_profiles gp
        JOIN users u ON gp.user_id = u.id
        WHERE gp.id = ?
    ");
    $stmt->execute([$profileId]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$profile) {
        echo json_encode(['error' => 'Profil non trouvé'], JSON_PRETTY_PRINT);
        exit;
    }

    // Supprimer le profil
    $stmt = $db->prepare("DELETE FROM game_profiles WHERE id = ?");
    $stmt->execute([$profileId]);

    echo json_encode([
        'success' => true,
        'message' => 'Profil supprimé',
        'deleted_profile' => $profile
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()], JSON_PRETTY_PRINT);
}
?>
