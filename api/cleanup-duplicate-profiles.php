<?php
/**
 * Script pour nettoyer les profils de jeu en double
 * Garde uniquement le profil le plus récent pour chaque user_id/game
 */

require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $db = getDB();

    // Trouver les profils en double (même user_id + game)
    $stmt = $db->query("
        SELECT user_id, game, COUNT(*) as count
        FROM game_profiles
        GROUP BY user_id, game
        HAVING count > 1
    ");
    
    $duplicates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $deletedCount = 0;
    $kept = [];

    foreach ($duplicates as $dup) {
        // Pour chaque doublon, garder le plus récent et supprimer les autres
        $stmt = $db->prepare("
            SELECT id, updated_at
            FROM game_profiles
            WHERE user_id = ? AND game = ?
            ORDER BY updated_at DESC
        ");
        $stmt->execute([$dup['user_id'], $dup['game']]);
        $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Garder le premier (le plus récent)
        $keepId = $profiles[0]['id'];
        $kept[] = [
            'user_id' => $dup['user_id'],
            'game' => $dup['game'],
            'kept_profile_id' => $keepId,
            'kept_date' => $profiles[0]['updated_at']
        ];

        // Supprimer les autres
        for ($i = 1; $i < count($profiles); $i++) {
            $stmt = $db->prepare("DELETE FROM game_profiles WHERE id = ?");
            $stmt->execute([$profiles[$i]['id']]);
            $deletedCount++;
        }
    }

    echo json_encode([
        'success' => true,
        'duplicates_found' => count($duplicates),
        'profiles_deleted' => $deletedCount,
        'kept_profiles' => $kept
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
