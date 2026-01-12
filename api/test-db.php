<?php
/**
 * Script de test de connexion à la base de données
 */

echo "<h1>Test de connexion MySQL</h1>";
echo "<pre>";

$host = 'localhost';
$dbname = 'u639530603_SafeMates';
$user = 'u639530603_Entrane';
$pass = 'En70frevaern@';

echo "Configuration:\n";
echo "Hôte: $host\n";
echo "Base: $dbname\n";
echo "User: $user\n";
echo "Pass: " . str_repeat('*', strlen($pass)) . "\n\n";

echo "Test de connexion...\n";

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Connexion réussie!\n\n";

    // Tester une requête simple
    $stmt = $pdo->query("SELECT DATABASE() as db, VERSION() as version");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "Base de données active: " . $result['db'] . "\n";
    echo "Version MySQL: " . $result['version'] . "\n\n";

    // Lister les tables existantes
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "Tables existantes (" . count($tables) . "):\n";
    if (count($tables) > 0) {
        foreach ($tables as $table) {
            echo "  - $table\n";
        }
    } else {
        echo "  (aucune table)\n";
    }

} catch (PDOException $e) {
    echo "❌ ERREUR DE CONNEXION\n\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
}

echo "</pre>";
?>
