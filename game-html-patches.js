/**
 * Patches JavaScript pour game.html
 * À intégrer dans le fichier game.html
 */

// === PATCH 1: Fonction de mapping rank → rank_level ===
// À ajouter après la définition de userGameData (vers ligne 1400)

/**
 * Mapping des rangs vers rank_level (doit correspondre au backend)
 */
const RANK_LEVEL_MAP = {
    'fer1': 1, 'fer2': 2, 'fer3': 3,
    'bronze1': 4, 'bronze2': 5, 'bronze3': 6,
    'argent1': 7, 'argent2': 8, 'argent3': 9,
    'silver1': 7, 'silver2': 8, 'silver3': 9,
    'or1': 10, 'or2': 11, 'or3': 12,
    'gold': 11, 'gold1': 10, 'gold2': 11, 'gold3': 12,
    'platine1': 13, 'platine2': 14, 'platine3': 15,
    'platinum1': 13, 'platinum2': 14, 'platinum3': 15,
    'diamant1': 16, 'diamant2': 17, 'diamant3': 18,
    'diamond1': 16, 'diamond2': 17, 'diamond3': 18,
    'ascendant1': 19, 'ascendant2': 20, 'ascendant3': 21,
    'immortal1': 22, 'immortal2': 23, 'immortal3': 24,
    'master': 23,
    'radiant': 25
};

/**
 * Calcule le rank_level depuis un slug de rang
 */
function getRankLevel(rankSlug) {
    if (!rankSlug) return null;
    const normalized = rankSlug.toLowerCase().trim();
    return RANK_LEVEL_MAP[normalized] || null;
}

// === PATCH 2: Modifier la fonction saveRankSettings ===
// Remplacer la fonction existante (vers ligne 1640-1678)

async function saveRankSettings() {
    if (!userGameData.rank || !userGameData.mainMode) {
        console.error('❌ Rang ou mode manquant:', {rank: userGameData.rank, mainMode: userGameData.mainMode});
        alert('Veuillez sélectionner un rang et un mode de jeu');
        return;
    }

    // Calculer le rank_level
    const rankLevel = getRankLevel(userGameData.rank);
    if (rankLevel === null) {
        console.error('❌ Rang invalide:', userGameData.rank);
        alert('Erreur: rang invalide');
        return;
    }

    console.log('💾 Sauvegarde du profil avec rank_level:', {
        rank: userGameData.rank,
        rank_level: rankLevel,
        mode: userGameData.mainMode,
        style: userGameData.style,
        tolerance: userGameData.rankTolerance
    });

    // Nouveau payload selon la spécification
    const profilePayload = {
        rank: userGameData.rank,
        rank_level: rankLevel,
        mode: userGameData.mainMode,
        style: userGameData.style || '',
        tolerance: userGameData.rankTolerance || 1
    };

    try {
        // Utiliser le nouveau endpoint /api/profile/:gameSlug
        const response = await fetchProtected(`/api/profile/${gameId}`, {
            method: 'POST',
            body: JSON.stringify(profilePayload)
        });

        console.log('📡 Réponse sauvegarde:', response.status, response.statusText);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Profil sauvegardé:', result);
            alert('Paramètres de jeu sauvegardés !');
        } else if (response.status !== 401) {
            const error = await response.json().catch(() => ({}));
            console.error('❌ Erreur sauvegarde:', response.status, error);
            alert(error.error || "Erreur lors de la sauvegarde des paramètres de jeu.");
        }
    } catch (error) {
        console.error('❌ Exception sauvegarde:', error);
        alert("Erreur réseau lors de la sauvegarde.");
    }
}

// === PATCH 3: Supprimer la fonction savePartnerPreferences ===
// Cette fonction n'est plus nécessaire car tout est dans /api/profile

// === PATCH 4: Modifier la fonction fetchMatches ===
// Remplacer la fonction existante (vers ligne 1734-1758)

async function fetchMatches() {
    console.log('🔍 Recherche de partenaires sur le serveur...');

    try {
        // Utiliser la route legacy (la nouvelle route .htaccess ne fonctionne pas encore)
        const response = await fetchProtected(`/api/match/search.php?game=${gameId}`);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Résultats reçus:', result);
            renderMatches(result.matches || []);
        } else if (response.status !== 401) {
            // Erreur côté serveur
            partnerSearchButton.innerHTML = `<i class="fas fa-search"></i> <span>Rechercher un partenaire</span>`;
            partnerSearchButton.classList.remove('searching');
            userGameData.isSearching = false;
            renderMatches([]);

            try {
                const err = await response.json();
                console.error('❌ Erreur recherche:', err);
                alert("Erreur de recherche : " + (err.error || err.message || "Veuillez configurer votre profil de jeu."));
            } catch {
                alert("Erreur de recherche. Serveur injoignable.");
            }
        }
    } catch (error) {
        console.error('❌ Exception recherche:', error);
        partnerSearchButton.innerHTML = `<i class="fas fa-search"></i> <span>Rechercher un partenaire</span>`;
        partnerSearchButton.classList.remove('searching');
        userGameData.isSearching = false;
        renderMatches([]);
        alert("Erreur réseau lors de la recherche.");
    }
}

// === PATCH 5: Modifier renderMatches pour la nouvelle structure ===
// La nouvelle API retourne une structure simplifiée sans compatibility score

// Vérifier la fonction renderMatches existante et s'assurer qu'elle gère:
// - match.username
// - match.rank
// - match.rank_level (optionnel, pour affichage)
// - match.mode
// - match.style

// Pas de changements majeurs nécessaires si la fonction utilisait déjà username, rank, mode

console.log('✅ Patches JavaScript chargés pour la refonte du matchmaking');
