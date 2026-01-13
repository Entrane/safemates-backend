<?php
/**
 * API de contact - Envoi de messages via formulaire
 * POST /api/contact - Envoyer un message à l'équipe SafeMates
 */

require_once __DIR__ . '/config.php';

// Permettre les requêtes depuis le frontend
header('Content-Type: application/json');

// Récupérer les données POST
$data = json_decode(file_get_contents('php://input'), true);

// Validation des champs requis
if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
    sendJSON(['error' => 'Tous les champs sont requis'], 400);
}

// Validation de l'email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    sendJSON(['error' => 'Email invalide'], 400);
}

// Sanitize des données
$name = sanitize($data['name']);
$email = sanitize($data['email']);
$subject = sanitize($data['subject'] ?? 'Contact SafeMates');
$message = sanitize($data['message']);

// Protection anti-spam basique
if (strlen($message) < 10) {
    sendJSON(['error' => 'Le message est trop court'], 400);
}

try {
    // Adresse email de destination
    $to = 'matchmates@contact.com';

    // En-têtes de l'email
    $headers = [
        'From: SafeMates Contact <noreply@safemates.fr>',
        'Reply-To: ' . $email,
        'X-Mailer: PHP/' . phpversion(),
        'Content-Type: text/html; charset=UTF-8'
    ];

    // Corps du message en HTML
    $emailBody = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00d4ff, #a855f7); padding: 20px; border-radius: 8px 8px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #00d4ff; }
            .message-box { background: white; padding: 20px; margin-top: 15px; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>💬 Nouveau message - SafeMates</h1>
            </div>
            <div class='content'>
                <div class='info'>
                    <strong>De:</strong> {$name}<br>
                    <strong>Email:</strong> <a href='mailto:{$email}'>{$email}</a><br>
                    <strong>Sujet:</strong> {$subject}
                </div>

                <div class='message-box'>
                    <strong>Message:</strong><br><br>
                    " . nl2br(htmlspecialchars($message)) . "
                </div>

                <div class='footer'>
                    Message reçu via le formulaire de contact SafeMates<br>
                    " . date('d/m/Y à H:i:s') . "
                </div>
            </div>
        </div>
    </body>
    </html>
    ";

    // Envoi de l'email
    $emailSent = mail($to, "SafeMates Contact: " . $subject, $emailBody, implode("\r\n", $headers));

    if ($emailSent) {
        // Log de l'envoi (optionnel)
        error_log("Contact form submission from {$email}: {$subject}");

        sendJSON([
            'success' => true,
            'message' => 'Message envoyé avec succès'
        ], 200);
    } else {
        throw new Exception('Erreur lors de l\'envoi de l\'email');
    }

} catch (Exception $e) {
    error_log("Erreur envoi contact: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de l\'envoi du message'], 500);
}
?>
