<?php
/**
 * Script de vérification de la configuration
 * Uploadez ce fichier dans api/ et accédez à /api/check-setup.php
 * Ce script vous dira exactement ce qui ne fonctionne pas
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérification Configuration MatchMates</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 20px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #22c55e;
            padding-bottom: 10px;
        }
        .section {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .success {
            color: #22c55e;
            font-weight: bold;
        }
        .error {
            color: #ef4444;
            font-weight: bold;
        }
        .warning {
            color: #f59e0b;
            font-weight: bold;
        }
        pre {
            background: #f8f9fa;
            padding: 10px;
            border-left: 4px solid #22c55e;
            overflow-x: auto;
        }
        .check-item {
            padding: 10px;
            margin: 5px 0;
            border-left: 4px solid #ddd;
        }
        .check-item.ok {
            border-left-color: #22c55e;
            background: #f0fdf4;
        }
        .check-item.fail {
            border-left-color: #ef4444;
            background: #fef2f2;
        }
        .check-item.warn {
            border-left-color: #f59e0b;
            background: #fffbeb;
        }
        code {
            background: #e5e7eb;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <h1>🔍 Vérification de la configuration MatchMates</h1>

    <?php
    $checks = [];
    $errors = 0;
    $warnings = 0;

    // Vérification 1 : PHP Version
    echo '<div class="section">';
    echo '<h2>1. Version PHP</h2>';
    $phpVersion = phpversion();
    if (version_compare($phpVersion, '7.4.0') >= 0) {
        echo '<div class="check-item ok">✅ PHP ' . $phpVersion . ' (OK)</div>';
    } else {
        echo '<div class="check-item fail">❌ PHP ' . $phpVersion . ' (Version trop ancienne, minimum 7.4 requis)</div>';
        $errors++;
    }
    echo '</div>';

    // Vérification 2 : Extensions PHP
    echo '<div class="section">';
    echo '<h2>2. Extensions PHP requises</h2>';

    $requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
    foreach ($requiredExtensions as $ext) {
        if (extension_loaded($ext)) {
            echo '<div class="check-item ok">✅ Extension ' . $ext . ' installée</div>';
        } else {
            echo '<div class="check-item fail">❌ Extension ' . $ext . ' manquante</div>';
            $errors++;
        }
    }
    echo '</div>';

    // Vérification 3 : Fichier config.php
    echo '<div class="section">';
    echo '<h2>3. Fichier config.php</h2>';

    if (file_exists('config.php')) {
        echo '<div class="check-item ok">✅ Le fichier config.php existe</div>';

        // Inclure le fichier
        require_once 'config.php';

        // Vérifier les constantes
        if (defined('DB_HOST') && defined('DB_NAME') && defined('DB_USER') && defined('DB_PASS')) {
            echo '<div class="check-item ok">✅ Constantes de base de données définies</div>';

            echo '<pre>';
            echo 'DB_HOST: ' . DB_HOST . "\n";
            echo 'DB_NAME: ' . DB_NAME . "\n";
            echo 'DB_USER: ' . DB_USER . "\n";
            echo 'DB_PASS: ' . str_repeat('*', strlen(DB_PASS)) . "\n";
            echo '</pre>';

            // Vérifier les valeurs par défaut
            if (DB_USER === 'root' && DB_PASS === '') {
                echo '<div class="check-item warn">⚠️ Vous utilisez les identifiants par défaut (root sans mot de passe). Changez-les avec vos identifiants Hostinger !</div>';
                $warnings++;
            }
        } else {
            echo '<div class="check-item fail">❌ Constantes de base de données manquantes</div>';
            $errors++;
        }

        // Vérifier les secrets
        if (defined('JWT_SECRET') && defined('SESSION_SECRET')) {
            if (JWT_SECRET === 'VotreSecretJWTTresSecurise123!@#' ||
                SESSION_SECRET === 'VotreSecretSessionTresSecurise456$%^') {
                echo '<div class="check-item warn">⚠️ Secrets JWT/SESSION par défaut détectés. Changez-les pour la production !</div>';
                $warnings++;
            } else {
                echo '<div class="check-item ok">✅ Secrets JWT/SESSION personnalisés</div>';
            }
        } else {
            echo '<div class="check-item fail">❌ Secrets JWT/SESSION non définis</div>';
            $errors++;
        }
    } else {
        echo '<div class="check-item fail">❌ Le fichier config.php est manquant !</div>';
        $errors++;
    }
    echo '</div>';

    // Vérification 4 : Connexion à la base de données
    echo '<div class="section">';
    echo '<h2>4. Connexion à la base de données</h2>';

    if (file_exists('config.php')) {
        try {
            $pdo = getDB();
            echo '<div class="check-item ok">✅ Connexion à la base de données réussie</div>';

            // Vérifier les tables
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

            if (count($tables) > 0) {
                echo '<div class="check-item ok">✅ Base de données installée (' . count($tables) . ' tables trouvées)</div>';
                echo '<pre>Tables : ' . implode(', ', $tables) . '</pre>';
            } else {
                echo '<div class="check-item warn">⚠️ Base de données vide. Exécutez install.php pour créer les tables.</div>';
                echo '<p>Accédez à : <a href="install.php?password=matchmates2024">install.php?password=matchmates2024</a></p>';
                $warnings++;
            }
        } catch (PDOException $e) {
            echo '<div class="check-item fail">❌ Erreur de connexion à la base de données</div>';
            echo '<pre>Erreur : ' . htmlspecialchars($e->getMessage()) . '</pre>';
            echo '<p><strong>Solutions :</strong></p>';
            echo '<ul>';
            echo '<li>Vérifiez que la base de données existe dans le panneau Hostinger</li>';
            echo '<li>Vérifiez les identifiants dans config.php (DB_HOST, DB_NAME, DB_USER, DB_PASS)</li>';
            echo '<li>Vérifiez que l\'utilisateur a les droits sur la base de données</li>';
            echo '</ul>';
            $errors++;
        }
    }
    echo '</div>';

    // Vérification 5 : Fichiers API
    echo '<div class="section">';
    echo '<h2>5. Fichiers API</h2>';

    $apiFiles = ['config.php', 'signup.php', 'login.php', 'health.php', 'install.php'];
    foreach ($apiFiles as $file) {
        if (file_exists($file)) {
            echo '<div class="check-item ok">✅ ' . $file . ' présent</div>';
        } else {
            echo '<div class="check-item fail">❌ ' . $file . ' manquant</div>';
            $errors++;
        }
    }
    echo '</div>';

    // Vérification 6 : .htaccess
    echo '<div class="section">';
    echo '<h2>6. Fichier .htaccess</h2>';

    if (file_exists('../.htaccess')) {
        echo '<div class="check-item ok">✅ Le fichier .htaccess existe à la racine</div>';
    } else {
        echo '<div class="check-item warn">⚠️ Le fichier .htaccess est manquant. Les URLs simplifiées (/signup, /login) ne fonctionneront pas.</div>';
        echo '<p>Utilisez les URLs complètes : /api/signup.php, /api/login.php</p>';
        $warnings++;
    }
    echo '</div>';

    // Vérification 7 : Permissions
    echo '<div class="section">';
    echo '<h2>7. Permissions</h2>';

    if (is_writable('.')) {
        echo '<div class="check-item ok">✅ Le dossier api/ est accessible en écriture</div>';
    } else {
        echo '<div class="check-item warn">⚠️ Le dossier api/ n\'est pas accessible en écriture (peut causer des problèmes)</div>';
        $warnings++;
    }
    echo '</div>';

    // Résumé final
    echo '<div class="section">';
    echo '<h2>📊 Résumé</h2>';

    if ($errors === 0 && $warnings === 0) {
        echo '<div class="check-item ok">';
        echo '<h3>✅ Tout est OK !</h3>';
        echo '<p>Votre configuration est correcte. Vous pouvez maintenant :</p>';
        echo '<ol>';
        echo '<li>Tester l\'API : <a href="health.php">health.php</a></li>';
        echo '<li>Tester la page complète : <a href="../test-api.html">test-api.html</a></li>';
        echo '<li>Créer un compte : <a href="../signup.html">signup.html</a></li>';
        echo '</ol>';
        echo '<p><strong>N\'oubliez pas de supprimer ce fichier check-setup.php après vérification !</strong></p>';
        echo '</div>';
    } else {
        echo '<div class="check-item fail">';
        echo '<h3>❌ Des problèmes ont été détectés</h3>';
        echo '<p><strong>Erreurs :</strong> ' . $errors . '</p>';
        echo '<p><strong>Avertissements :</strong> ' . $warnings . '</p>';
        echo '<p>Corrigez les erreurs ci-dessus avant de continuer.</p>';
        echo '</div>';
    }
    echo '</div>';

    // Informations système
    echo '<div class="section">';
    echo '<h2>ℹ️ Informations système</h2>';
    echo '<pre>';
    echo 'Serveur : ' . $_SERVER['SERVER_SOFTWARE'] . "\n";
    echo 'PHP Version : ' . phpversion() . "\n";
    echo 'Chemin actuel : ' . __DIR__ . "\n";
    echo 'Document Root : ' . $_SERVER['DOCUMENT_ROOT'] . "\n";
    echo '</pre>';
    echo '</div>';
    ?>

    <div class="section">
        <h2>📚 Aide</h2>
        <p>Si vous avez des erreurs, consultez :</p>
        <ul>
            <li><strong>GUIDE_HOSTINGER_PAS_A_PAS.md</strong> - Guide détaillé avec captures</li>
            <li><strong>DEPLOIEMENT_RAPIDE.md</strong> - Guide rapide en 5 minutes</li>
            <li><strong>PHP_DEPLOYMENT_GUIDE.md</strong> - Guide complet de déploiement</li>
        </ul>
    </div>
</body>
</html>
