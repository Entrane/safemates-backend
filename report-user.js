/**
 * Module de signalement d'utilisateur
 * A inclure dans game.html et dashboard.html
 */
(function() {
    'use strict';

    function createReportModal() {
        const modalHTML = `
            <div id="reportUserModal" style="display: none; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);" onclick="window.closeReportModal()">
                <div style="background-color: white; margin: 5% auto; padding: 30px; border-radius: 12px; max-width: 500px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">
                    <h2 style="margin: 0 0 20px 0; color: #333;">Signaler un utilisateur</h2>

                    <form id="reportUserForm">
                        <input type="hidden" id="reportedUsername">

                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Utilisateur signalé</label>
                            <input type="text" id="reportedUsernameDisplay" readonly style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; background: #f5f5f5; color: #333; font-weight: 600;">
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Raison du signalement *</label>
                            <select id="reportReason" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; background: white; color: #333; position: relative; z-index: 1;">
                                <option value="">Sélectionnez une raison</option>
                                <option value="harassment">Harcèlement</option>
                                <option value="hate_speech">Discours haineux / Insultes</option>
                                <option value="inappropriate_content">Contenu inapproprié</option>
                                <option value="spam">Spam / Publicité</option>
                                <option value="cheating">Triche</option>
                                <option value="charter_violation">Violation de la charte</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Description (optionnel)</label>
                            <textarea id="reportDescription" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; resize: vertical; min-height: 100px; font-family: inherit; color: #333; background: white;" placeholder="Décrivez ce qui s'est passé..."></textarea>
                        </div>

                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" onclick="window.closeReportModal()" style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; background: #e0e0e0; color: #333;">
                                Annuler
                            </button>
                            <button type="submit" style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; background: #ef5350; color: white;">
                                Signaler
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    window.openReportModal = function(username) {
        if (!username) {
            console.error("Nom d'utilisateur requis pour le signalement");
            return;
        }

        if (!document.getElementById('reportUserModal')) {
            createReportModal();
        }

        document.getElementById('reportedUsername').value = username;
        document.getElementById('reportedUsernameDisplay').value = username;
        document.getElementById('reportUserModal').style.display = 'block';
    };

    window.closeReportModal = function() {
        const modal = document.getElementById('reportUserModal');
        if (modal) modal.style.display = 'none';
        const form = document.getElementById('reportUserForm');
        if (form) form.reset();
    };

    function setupReportForm() {
        const form = document.getElementById('reportUserForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const reportedUsername = document.getElementById('reportedUsername').value;
            const reason = document.getElementById('reportReason').value;
            const description = document.getElementById('reportDescription').value;

            if (!reportedUsername || !reason) {
                alert('Veuillez remplir tous les champs obligatoires');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Vous devez être connecté pour signaler un utilisateur');
                window.location.href = '/login';
                return;
            }

            try {
                const useFetchProtected = typeof window.fetchProtected === 'function';
                const baseOptions = {
                    method: 'POST',
                    body: JSON.stringify({ reportedUsername, reason, description })
                };

                const response = await (useFetchProtected
                    ? window.fetchProtected('/api/reports.php', baseOptions)
                    : fetch('/api/reports.php', {
                        ...baseOptions,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                );

                let data = {};
                try {
                    data = await response.clone().json();
                } catch (_) {
                    data = {};
                }

                if (response.ok) {
                    alert('Signalement envoyé avec succès. Notre équipe va l\'examiner.');
                    window.closeReportModal();
                } else if (data.error === 'cannot_report_self') {
                    alert('Vous ne pouvez pas vous signaler vous-même');
                } else if (data.error === 'user_not_found') {
                    alert('Utilisateur introuvable');
                } else if (response.status === 401) {
                    alert('Session expirée. Veuillez vous reconnecter.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    alert(data.message || 'Erreur lors du signalement');
                }
            } catch (error) {
                console.error('Erreur signalement:', error);
                alert('Erreur lors de l\'envoi du signalement');
            }
        });
    }

    window.addReportButton = function(container, username) {
        if (!container || !username) return;

        const button = document.createElement('button');
        button.textContent = '! Signaler';
        button.title = 'Signaler cet utilisateur';
        button.style.cssText = 'padding: 5px 10px; background: #ef5350; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; margin-left: 10px;';
        button.onclick = () => window.openReportModal(username);

        container.appendChild(button);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createReportModal();
            setupReportForm();
        });
    } else {
        createReportModal();
        setupReportForm();
    }

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('reportUserModal');
        if (event.target === modal) {
            window.closeReportModal();
        }
    });

    console.log('Module de signalement chargé');
})();
