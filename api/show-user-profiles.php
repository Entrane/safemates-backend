<?php
/**
 * Script pour afficher tous les profils d'un utilisateur spécifique
 */

require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

$username = isset($_GET['username']) ? $_GET['username'] : 'Entrane';

try {
    $db = getDB();

    // Trouver l'ID utilisateur
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode(['error' => 'Utilisateur non trouvé'], JSON_PRETTY_PRINT);
        exit;
    }

    // Récupérer TOUS les profils de cet utilisateur
    $stmt = $db->prepare("
        SELECT 
            id,
            user_id,
            game,
            rank,
            mode,
            tolerance,
            preferred_ranks,
            style,
            options,
            updated_at
        FROM game_profiles
        WHERE user_id = ?
        ORDER BY game, updated_at DESC
    ");
    $stmt->execute([$user['id']]);
    $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'username' => $username,
        'user_id' => $user['id'],
        'total_profiles' => count($profiles),
        'profiles' => $profiles
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()], JSON_PRETTY_PRINT);
}
?>
