// ====================================================
// CHAT MANAGER GLOBAL - SYNCHRONISATION MULTI-ONGLETS
// ====================================================

class ChatManager {
    constructor() {
        this.messages = new Map(); // Utilise Map pour éviter les doublons
        this.subscribers = [];
        this.currentUserId = null;
        this.currentUsername = null;
        this.activeChats = {};
        this.pollingInterval = null;
        this.isInitialized = false;
        this.lastReadMessageIds = new Map(); // Suivi des derniers messages lus par utilisateur

        // Initialiser dès que possible
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        if (this.isInitialized) return;
        
        // Récupérer les infos utilisateur
        this.currentUserId = parseInt(localStorage.getItem('user_id'));
        this.currentUsername = localStorage.getItem('username');
        
        if (!this.currentUserId || !this.currentUsername) {
            console.warn('ChatManager: Utilisateur non connecté');
            return;
        }
        
        // Charger les messages depuis le localStorage
        this.loadMessagesFromCache();

        // Charger les IDs des derniers messages lus
        this.loadLastReadMessageIds();

        // Écouter les changements d'autres onglets
        window.addEventListener('storage', (e) => {
            if (e.key === 'mm_chat_messages' && e.newValue) {
                this.handleStorageChange(e.newValue);
            }
        });

        // Démarrer le polling global (toutes les 3 secondes)
        this.startGlobalPolling();

        this.isInitialized = true;
        console.log('✅ ChatManager initialisé pour:', this.currentUsername);
    }
    
    // Charger les messages du cache
    loadMessagesFromCache() {
        try {
            const cached = localStorage.getItem('mm_chat_messages');
            if (cached) {
                const messagesArray = JSON.parse(cached);
                this.messages.clear();
                messagesArray.forEach(msg => {
                    this.messages.set(msg.id, msg);
                });
            }
        } catch (error) {
            console.error('Erreur chargement cache messages:', error);
        }
    }
    
    // Gérer les changements de localStorage (autre onglet)
    handleStorageChange(newValue) {
        try {
            const messagesArray = JSON.parse(newValue);
            const oldSize = this.messages.size;
            
            this.messages.clear();
            messagesArray.forEach(msg => {
                this.messages.set(msg.id, msg);
            });
            
            // Notifier seulement s'il y a de nouveaux messages
            if (this.messages.size > oldSize) {
                this.notifySubscribers();
            }
        } catch (error) {
            console.error('Erreur traitement changement storage:', error);
        }
    }
    
    // S'abonner aux mises à jour
    subscribe(callback) {
        this.subscribers.push(callback);
    }
    
    // Se désabonner
    unsubscribe(callback) {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
            this.subscribers.splice(index, 1);
        }
    }
    
    // Notifier tous les abonnés
    notifySubscribers() {
        const messagesArray = Array.from(this.messages.values());
        this.subscribers.forEach(callback => {
            try {
                callback(messagesArray);
            } catch (error) {
                console.error('Erreur callback subscriber:', error);
            }
        });
    }
    
    // Ajouter un message
    addMessage(message) {
        if (!message || !message.id) {
            console.warn('Message invalide:', message);
            return false;
        }
        
        // Vérifier si le message existe déjà
        if (this.messages.has(message.id)) {
            return false;
        }
        
        this.messages.set(message.id, message);
        this.saveToLocalStorage();
        this.notifySubscribers();
        return true;
    }
    
    // Ajouter plusieurs messages
    addMessages(messagesArray) {
        if (!Array.isArray(messagesArray)) return;
        
        let hasNewMessages = false;
        messagesArray.forEach(msg => {
            if (msg && msg.id && !this.messages.has(msg.id)) {
                this.messages.set(msg.id, msg);
                hasNewMessages = true;
            }
        });
        
        if (hasNewMessages) {
            this.saveToLocalStorage();
            this.notifySubscribers();
        }
    }
    
    // Sauvegarder dans localStorage
    saveToLocalStorage() {
        try {
            const messagesArray = Array.from(this.messages.values());
            localStorage.setItem('mm_chat_messages', JSON.stringify(messagesArray));
        } catch (error) {
            console.error('Erreur sauvegarde localStorage:', error);
        }
    }
    
    // Récupérer les messages avec un utilisateur
    getMessagesWithUser(username) {
        return Array.from(this.messages.values())
            .filter(msg => 
                (msg.sender_id === this.currentUserId && msg.receiver_username === username) ||
                (msg.sender_username === username && msg.receiver_id === this.currentUserId)
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
    
    // Vérifier si c'est notre propre message
    isOwnMessage(message) {
        return message.from_user_id === this.currentUserId || message.from_username === this.currentUsername;
    }
    
    // Démarrer le polling global
    startGlobalPolling() {
        if (this.pollingInterval) return;
        
        // Polling toutes les 3 secondes pour tous les chats actifs
        this.pollingInterval = setInterval(() => {
            const activeUsernames = Object.keys(this.activeChats);
            if (activeUsernames.length > 0) {
                activeUsernames.forEach(username => {
                    this.fetchMessagesForUser(username);
                });
            }
        }, 3000);
    }
    
    // Arrêter le polling
    stopGlobalPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
    
    // Récupérer les messages pour un utilisateur spécifique
    async fetchMessagesForUser(username) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`/api/messages-standalone.php?with=${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const messages = await response.json();
                this.addMessages(messages);
            } else if (response.status === 401) {
                // Token expiré, rediriger
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } catch (error) {
            console.error(`Erreur fetch messages pour ${username}:`, error);
        }
    }
    
    // Enregistrer un chat comme actif
    registerActiveChat(username) {
        this.activeChats[username] = true;
        // Charger immédiatement les messages pour ce chat
        this.fetchMessagesForUser(username);
    }
    
    // Désenregistrer un chat
    unregisterActiveChat(username) {
        delete this.activeChats[username];
    }
    
    // Envoyer un message
    async sendMessage(toUsername, content) {
        if (!content || !content.trim()) {
            return { success: false, error: 'Message vide' };
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, error: 'Non authentifié' };
            }
            
            const response = await fetch('/api/messages-standalone.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    toUsername: toUsername,
                    content: content.trim()
                })
            });
            
            if (response.ok) {
                const newMessage = await response.json();
                this.addMessage(newMessage);
                return { success: true, message: newMessage };
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return { success: false, error: 'Session expirée' };
            } else {
                const error = await response.json();
                return { success: false, error: error.message || 'Erreur envoi' };
            }
        } catch (error) {
            console.error('Erreur envoi message:', error);
            return { success: false, error: 'Erreur réseau' };
        }
    }
    
    // Obtenir le nombre de messages non lus d'un utilisateur
    getUnreadCount(username) {
        const messages = this.getMessagesWithUser(username);
        const lastReadId = this.lastReadMessageIds.get(username) || 0;

        return messages.filter(msg => {
            // Compter seulement les messages reçus (pas les nôtres) et non lus
            return msg.id > lastReadId && !this.isOwnMessage(msg);
        }).length;
    }

    // Marquer tous les messages d'un utilisateur comme lus
    markAsRead(username) {
        const messages = this.getMessagesWithUser(username);
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            this.lastReadMessageIds.set(username, lastMessage.id);
            // Sauvegarder dans le localStorage
            this.saveLastReadMessageIds();
            // Notifier les subscribers
            this.notifySubscribers();
        }
    }

    // Sauvegarder les IDs des derniers messages lus
    saveLastReadMessageIds() {
        const obj = {};
        this.lastReadMessageIds.forEach((id, username) => {
            obj[username] = id;
        });
        localStorage.setItem('mm_last_read_messages', JSON.stringify(obj));
    }

    // Charger les IDs des derniers messages lus
    loadLastReadMessageIds() {
        try {
            const data = localStorage.getItem('mm_last_read_messages');
            if (data) {
                const obj = JSON.parse(data);
                Object.keys(obj).forEach(username => {
                    this.lastReadMessageIds.set(username, obj[username]);
                });
            }
        } catch (error) {
            console.error('Erreur chargement last read IDs:', error);
        }
    }

    // Obtenir le nombre total de messages non lus
    getTotalUnreadCount() {
        let total = 0;
        // Parcourir tous les utilisateurs avec qui on a des messages
        const users = new Set();
        this.messages.forEach(msg => {
            const otherUser = msg.from_username === this.currentUsername
                ? msg.to_username
                : msg.from_username;
            users.add(otherUser);
        });

        users.forEach(username => {
            total += this.getUnreadCount(username);
        });

        return total;
    }

    // Nettoyer lors de la déconnexion
    cleanup() {
        this.stopGlobalPolling();
        this.messages.clear();
        this.subscribers = [];
        this.activeChats = {};
        this.lastReadMessageIds.clear();
        this.isInitialized = false;
    }
}

// Créer l'instance globale unique
if (!window.globalChatManager) {
    window.globalChatManager = new ChatManager();
}

// Exporter pour utilisation dans d'autres scripts
window.ChatManager = window.globalChatManager;

// Nettoyer lors de la déconnexion
window.addEventListener('beforeunload', () => {
    if (window.globalChatManager) {
        window.globalChatManager.cleanup();
    }
});

console.log('✅ ChatManager chargé et prêt');