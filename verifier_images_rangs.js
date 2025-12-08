// Script de vérification des images de rangs
// Vérifie que toutes les images référencées dans game.html existent

const fs = require('fs');
const path = require('path');

// Configuration des rangs depuis game.html
const RANKS = {
    csgo: [
        { id: 'silver', name: 'Silver I', img: '/csgo_rank/silver.png' },
        { id: 'silver2', name: 'Silver II', img: '/csgo_rank/silver 2.png' },
        { id: 'silver3', name: 'Silver III', img: '/csgo_rank/silver3.png' },
        { id: 'silver4', name: 'Silver IV', img: '/csgo_rank/silver4.jpg' },
        { id: 'silver5', name: 'Silver Elite', img: '/csgo_rank/silver5.png' },
        { id: 'silver6', name: 'Silver Elite Master', img: '/csgo_rank/silver6.png' },
        { id: 'gold1', name: 'Gold Nova I', img: '/csgo_rank/gold_nova_1_cec4b69c20.png' },
        { id: 'gold2', name: 'Gold Nova II', img: '/csgo_rank/gold2.png' },
        { id: 'gold3', name: 'Gold Nova III', img: '/csgo_rank/goldnova3.png' },
        { id: 'gold4', name: 'Gold Nova Master', img: '/csgo_rank/gold4.png' },
        { id: 'mg1', name: 'Master Guardian I', img: '/csgo_rank/mastyerguardian1.webp' },
        { id: 'mg2', name: 'Master Guardian II', img: '/csgo_rank/masterguardian2.png' },
        { id: 'mge', name: 'Master Guardian Elite', img: '/csgo_rank/masterguardianélite.png' },
        { id: 'dmg', name: 'Distinguished Master Guardian', img: '/csgo_rank/distinguishedmasterguardian.jpg' },
        { id: 'le', name: 'Legendary Eagle', img: '/csgo_rank/legendaryeagle.png' },
        { id: 'lem', name: 'Legendary Eagle Master', img: '/csgo_rank/legendaryeaglemaster.jpg' },
        { id: 'supreme', name: 'Supreme Master First Class', img: '/csgo_rank/supreme_master_first_class_d274bcdb5f.png' },
        { id: 'global', name: 'Global Elite', img: '/csgo_rank/globalelite.jpg' },
    ],
    fortnite: [
        { id: 'bronze', name: 'Bronze', img: '/fortnite rank/bronze.webp' },
        { id: 'silver', name: 'Argent', img: '/fortnite rank/silver.png' },
        { id: 'gold', name: 'Or', img: '/fortnite rank/gold.webp' },
        { id: 'platine', name: 'Platine', img: '/fortnite rank/platine.png' },
        { id: 'diamant', name: 'Diamant', img: '/fortnite rank/diamant.webp' },
        { id: 'champion', name: 'Champion', img: '/fortnite rank/champion.webp' },
        { id: 'elite', name: 'Elite', img: '/fortnite rank/Elite_-_Icon_-_Fortnite.webp' },
        { id: 'unreal', name: 'Unreal', img: '/fortnite rank/unreal.webp' },
    ]
};

console.log('\n🔍 Vérification des images de rangs...\n');

let totalImages = 0;
let foundImages = 0;
let missingImages = [];

for (const [game, ranks] of Object.entries(RANKS)) {
    console.log(`\n📁 Jeu : ${game.toUpperCase()}`);
    console.log('─'.repeat(50));

    ranks.forEach(rank => {
        totalImages++;
        // Convertir le chemin URL en chemin système
        const imagePath = path.join(__dirname, rank.img.substring(1));

        if (fs.existsSync(imagePath)) {
            foundImages++;
            console.log(`  ✅ ${rank.name.padEnd(30)} → ${path.basename(imagePath)}`);
        } else {
            missingImages.push({ game, rank: rank.name, path: rank.img });
            console.log(`  ❌ ${rank.name.padEnd(30)} → ${path.basename(imagePath)} (MANQUANT)`);
        }
    });
}

console.log('\n' + '═'.repeat(50));
console.log(`\n📊 Résumé :`);
console.log(`   Total d'images : ${totalImages}`);
console.log(`   Images trouvées : ${foundImages} (${Math.round(foundImages/totalImages*100)}%)`);
console.log(`   Images manquantes : ${missingImages.length}`);

if (missingImages.length > 0) {
    console.log('\n⚠️  Images manquantes :');
    missingImages.forEach(img => {
        console.log(`   - ${img.game} / ${img.rank} : ${img.path}`);
    });
    console.log('\n💡 Action recommandée : Ajoutez les images manquantes ou mettez à jour les chemins dans game.html\n');
    process.exit(1);
} else {
    console.log('\n✅ Toutes les images sont présentes !\n');
    process.exit(0);
}
