#!/usr/bin/env python3
"""
Script pour ajouter Google Analytics à toutes les pages HTML
"""

import os
import re

# Code Google Analytics à ajouter
ANALYTICS_CODE = '''
  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script src="analytics.js"></script>
</head>'''

# Répertoire actuel
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Pages à modifier (exclure les pages de test)
HTML_FILES = [
    'dashboard.html',
    'game.html',
    'login.html',
    'signup.html',
    'profile.html',
    'contact.html',
    'moderation.html',
    '404.html',
    '500.html'
]

def add_analytics_to_html(filepath):
    """Ajoute le code Google Analytics avant </head>"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Vérifier si Google Analytics est déjà présent
    if 'googletagmanager.com/gtag' in content:
        print(f"✅ {os.path.basename(filepath)} - Déjà configuré")
        return False

    # Remplacer </head> par le code Analytics + </head>
    if '</head>' in content:
        new_content = content.replace('</head>', ANALYTICS_CODE)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"✅ {os.path.basename(filepath)} - Google Analytics ajouté")
        return True
    else:
        print(f"❌ {os.path.basename(filepath)} - Pas de balise </head> trouvée")
        return False

def main():
    print("🚀 Ajout de Google Analytics à toutes les pages HTML\n")
    print("=" * 60)

    modified_count = 0

    for filename in HTML_FILES:
        filepath = os.path.join(BASE_DIR, filename)

        if os.path.exists(filepath):
            if add_analytics_to_html(filepath):
                modified_count += 1
        else:
            print(f"⚠️  {filename} - Fichier non trouvé")

    print("=" * 60)
    print(f"\n✅ {modified_count} fichier(s) modifié(s)")
    print(f"\n⚠️  N'OUBLIEZ PAS de remplacer 'G-XXXXXXXXXX' par votre véritable ID de mesure Google Analytics !")
    print(f"    - Dans analytics.js (ligne 11)")
    print(f"    - Dans chaque fichier HTML modifié")

if __name__ == '__main__':
    main()
