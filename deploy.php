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

// Vérifier si git est disponible
echo "🔍 Vérification de Git...\n";
exec('which git 2>&1', $gitCheck);
if (empty($gitCheck)) {
    echo "❌ Git n'est pas installé ou accessible sur ce serveur.\n";
    echo "ℹ️  Contacte le support d'Hostinger pour activer Git.\n";
} else {
    echo "✅ Git trouvé: " . implode("\n", $gitCheck) . "\n\n";
}

// Vérifier l'état du repository
echo "📋 État du repository Git...\n";
exec('git status 2>&1', $statusOutput);
foreach ($statusOutput as $line) {
    echo $line . "\n";
}
echo "\n";

// Vérifier la branche actuelle
echo "🌿 Branche actuelle...\n";
exec('git branch 2>&1', $branchOutput);
foreach ($branchOutput as $line) {
    echo $line . "\n";
}
echo "\n";

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
    echo "\n💡 Solution alternative: Utilise le File Manager d'Hostinger pour:\n";
    echo "   1. Télécharger le fichier game.html depuis GitHub\n";
    echo "   2. Remplacer le fichier sur le serveur\n";
    echo "   3. Rafraîchir avec Ctrl+F5\n";
}

echo "\n⚠️  SÉCURITÉ: Supprimez ce fichier deploy.php après utilisation !\n";

echo "</pre>";
?>
