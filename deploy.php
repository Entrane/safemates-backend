<?php
/**
 * Script de déploiement automatique
 * Visite https://safemates.fr/deploy.php pour forcer la mise à jour
 *
 * IMPORTANT: Supprime ce fichier après utilisation pour des raisons de sécurité !
 */

echo "<h1>Déploiement SafeMates</h1>";
echo "<pre>";

// Chemin du repository (ajuste si nécessaire)
$repoPath = __DIR__;

echo "🚀 Démarrage du déploiement...\n\n";

// Se placer dans le répertoire du projet
chdir($repoPath);
echo "📂 Répertoire: $repoPath\n\n";

// Exécuter git pull
echo "📥 Récupération des dernières modifications...\n";
$output = [];
$returnVar = 0;

exec('git pull origin main 2>&1', $output, $returnVar);

foreach ($output as $line) {
    echo $line . "\n";
}

if ($returnVar === 0) {
    echo "\n✅ DÉPLOIEMENT RÉUSSI !\n";
    echo "\n🎉 Le site a été mis à jour avec succès.\n";
    echo "\nℹ️  Rafraîchissez votre navigateur avec Ctrl+F5 pour voir les changements.\n";
} else {
    echo "\n❌ ERREUR lors du déploiement.\n";
    echo "\nCode de retour: $returnVar\n";
}

echo "\n⚠️  SÉCURITÉ: Supprimez ce fichier deploy.php après utilisation !\n";

echo "</pre>";
?>
