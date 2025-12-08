/**
 * Google Analytics 4 (GA4)
 * Remplacez 'G-XXXXXXXXXX' par votre véritable ID de mesure
 */

// Charger Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// Configurer avec votre ID de mesure
gtag('config', 'G-XXXXXXXXXX', {
    'page_title': document.title,
    'page_location': window.location.href,
    'page_path': window.location.pathname
});

// Fonction pour tracker les événements personnalisés
function trackEvent(eventName, eventParams = {}) {
    gtag('event', eventName, eventParams);
}

// Tracker les clics sur les jeux
document.addEventListener('DOMContentLoaded', function() {
    // Tracker les clics sur les cartes de jeux
    document.querySelectorAll('a[href*="game.html"]').forEach(link => {
        link.addEventListener('click', function() {
            const gameUrl = this.getAttribute('href');
            const gameName = new URLSearchParams(gameUrl.split('?')[1]).get('game');
            trackEvent('game_click', {
                'game_name': gameName
            });
        });
    });

    // Tracker l'inscription
    const signupForm = document.querySelector('form[action*="signup"]');
    if (signupForm) {
        signupForm.addEventListener('submit', function() {
            trackEvent('sign_up_attempt');
        });
    }

    // Tracker la connexion
    const loginForm = document.querySelector('form[action*="login"]');
    if (loginForm) {
        loginForm.addEventListener('submit', function() {
            trackEvent('login_attempt');
        });
    }
});
