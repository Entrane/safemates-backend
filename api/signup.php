<?php
/**
 * API d'inscription
 * POST /api/signup.php
 */

require_once 'config.php';

// Vérifier que c'est bien une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Méthode non autorisée'], 405);
}

// Récupérer les données JSON
$data = getJsonInput();

// Validation des données
$username = isset($data['username']) ? sanitize($data['username']) : '';
$email = isset($data['email']) ? sanitize($data['email']) : '';
$password = isset($data['password']) ? $data['password'] : '';

// Vérifications
if (empty($username) || empty($email) || empty($password)) {
    sendJSON(['error' => 'Tous les champs sont requis'], 400);
}

if (strlen($username) < 3 || strlen($username) > 20) {
    sendJSON(['error' => 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères'], 400);
}

if (!isValidEmail($email)) {
    sendJSON(['error' => 'Adresse email invalide'], 400);
}

if (strlen($password) < 6) {
    sendJSON(['error' => 'Le mot de passe doit contenir au moins 6 caractères'], 400);
}

try {
    $db = getDB();

    // Vérifier si l'utilisateur existe déjà
    $stmt = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
    $stmt->execute([$username, $email]);

    if ($stmt->fetch()) {
        sendJSON(['error' => 'Cet utilisateur ou email existe déjà'], 409);
    }

    // Hasher le mot de passe
    $hashedPassword = hashPassword($password);

    // Insérer l'utilisateur
    $stmt = $db->prepare('
        INSERT INTO users (username, email, password, created_at, is_banned, is_admin)
        VALUES (?, ?, ?, ?, 0, 0)
    ');

    $createdAt = date('Y-m-d H:i:s');
    $stmt->execute([$username, $email, $hashedPassword, $createdAt]);

    $userId = $db->lastInsertId();

    // Démarrer la session PHP
    session_start();
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['email'] = $email;
    $_SESSION['is_admin'] = false;

    // Générer un token JWT
    $token = generateToken($userId, $username);

    // Succès
    sendJSON([
        'message' => 'Inscription réussie',
        'token' => $token,
        'user' => [
            'id' => $userId,
            'username' => $username,
            'email' => $email
        ]
    ], 201);

} catch (PDOException $e) {
    error_log("Erreur inscription: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de l\'inscription'], 500);
}
?>
