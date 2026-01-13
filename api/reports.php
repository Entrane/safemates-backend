<?php
/**
 * API de signalement d'utilisateurs
 * POST /api/reports.php
 */

require_once __DIR__ . '/config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Méthode non autorisée'], 405);
}

$authUser = requireAuth();
$reporterId = $authUser['userId'];

$input = getJsonInput();
$reportedUsername = $input['reportedUsername'] ?? null;
$reason = $input['reason'] ?? null;
$description = $input['description'] ?? '';

if (!$reportedUsername || !$reason) {
    sendJSON(['error' => 'Paramètres manquants'], 400);
}

try {
    $db = getDB();

    // Récupérer l'ID de l'utilisateur signalé
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$reportedUsername]);
    $reportedUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reportedUser) {
        sendJSON(['error' => 'Utilisateur non trouvé'], 404);
    }

    $reportedId = $reportedUser['id'];

    // Vérifier qu'on ne se signale pas soi-même
    if ($reporterId === $reportedId) {
        sendJSON(['error' => 'Vous ne pouvez pas vous signaler vous-même'], 400);
    }

    // Insérer le signalement
    $stmt = $db->prepare("
        INSERT INTO reports (reporter_id, reported_user_id, reason, description, created_at, status)
        VALUES (?, ?, ?, ?, NOW(), 'pending')
    ");
    $stmt->execute([$reporterId, $reportedId, $reason, $description]);

    sendJSON([
        'success' => true,
        'message' => 'Signalement enregistré avec succès'
    ]);

} catch (Exception $e) {
    error_log("Erreur /api/reports POST: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
