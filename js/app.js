/**
 * FlipIt - Consolidated JS for File Protocol Support
 */

// ==========================================
// STORE CLASS
// ==========================================
const STORAGE_KEYS = {
    USERS: 'flipit_users',
    CURRENT_USER: 'flipit_current_user',
    CARDS: 'flipit_cards' // Structure: { [username]: [cards] }
};

class Store {
    constructor() {
        this.memoryStore = {};
        this.useIndexedDB = false;
        this.useMemory = false;
    }

    async init() {
        try {
            if (typeof window.FlipItDB !== 'undefined') {
                this.useIndexedDB = await window.FlipItDB.init();
            }
            if (this.useIndexedDB && window.FlipItDB) {
                await this._migrateLocalStorageToIndexedDB();
            }
            if (!this.useIndexedDB) {
                if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
                    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
                }
                if (!localStorage.getItem(STORAGE_KEYS.CARDS)) {
                    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify({}));
                }
            }
        } catch (e) {
            console.error("Storage init failed:", e);
            this.useMemory = true;
            this.useIndexedDB = false;
            if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
            }
            if (!localStorage.getItem(STORAGE_KEYS.CARDS)) {
                localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify({}));
            }
        }
    }

    async _migrateLocalStorageToIndexedDB() {
        try {
            const existingUsers = await window.FlipItDB.getUsers();
            if (existingUsers.length > 0) return; // Already have data, skip migration
            const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
            const cardsRaw = localStorage.getItem(STORAGE_KEYS.CARDS);
            if (!usersRaw && !cardsRaw) return;
            const users = JSON.parse(usersRaw || '[]');
            const allCards = JSON.parse(cardsRaw || '{}');
            if (users.length) await window.FlipItDB.setAllUsers(users);
            for (const [username, cards] of Object.entries(allCards)) {
                if (!Array.isArray(cards) || cards.length === 0) continue;
                for (const c of cards) {
                    await window.FlipItDB.addCard({ ...c, username });
                }
            }
        } catch (e) {
            console.warn('LocalStorage to IndexedDB migration skipped:', e);
        }
    }

    _get(key) {
        if (this.useMemory) return this.memoryStore[key] || null;
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error(`LS Get Error (${key}):`, e);
            return this.memoryStore[key] || null;
        }
    }

    _set(key, val) {
        // Always update memory too just in case
        this.memoryStore[key] = val;

        if (!this.useMemory) {
            try {
                localStorage.setItem(key, val);
            } catch (e) {
                console.error(`LS Set Error (${key}):`, e);
                // Switch to memory mode if writing fails
                this.useMemory = true;
            }
        }
    }

    // --- Helper for UUID ---
    generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // --- User Management ---

    async login(username, password) {
        if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
            const email = `${username}@flipit.app`;
            try {
                await auth.signInWithEmailAndPassword(email, password);
                this.setCurrentUser(username);
                return { username };
            } catch (error) {
                throw new Error('Invalid username or password (Firebase)');
            }
        }
        const users = await this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) throw new Error('Invalid username or password');
        this.setCurrentUser(user.username);
        return user;
    }

    async register(username, password) {
        if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
            const email = `${username}@flipit.app`;
            try {
                await auth.createUserWithEmailAndPassword(email, password);
                this.setCurrentUser(username);
                return { username };
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    throw new Error('Username already exists');
                }
                throw error;
            }
        }
        const users = await this.getUsers();
        if (users.find(u => u.username === username)) {
            throw new Error('Username already exists');
        }
        users.push({ username, password });
        if (this.useIndexedDB && window.FlipItDB) {
            await window.FlipItDB.setAllUsers(users);
        } else {
            this._set(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
        this.setCurrentUser(username);
        return { username };
    }

    setCurrentUser(username) {
        this._set(STORAGE_KEYS.CURRENT_USER, username);
    }

    getCurrentUser() {
        return this._get(STORAGE_KEYS.CURRENT_USER);
    }

    logout() {
        if (!this.useMemory) localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        this.memoryStore[STORAGE_KEYS.CURRENT_USER] = null;
    }

    getUsers() {
        if (this.useIndexedDB && window.FlipItDB) {
            return window.FlipItDB.getUsers();
        }
        return Promise.resolve(JSON.parse(this._get(STORAGE_KEYS.USERS) || '[]'));
    }

    // --- Card Management ---

    getAllCardsMap() {
        return JSON.parse(this._get(STORAGE_KEYS.CARDS) || '{}');
    }

    async getUserCards(username) {
        if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
            if (!auth.currentUser) return [];
            const snapshot = await db.collection('users').doc(auth.currentUser.uid).collection('cards').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        if (this.useIndexedDB && window.FlipItDB) {
            return window.FlipItDB.getCardsByUsername(username);
        }
        const allCards = this.getAllCardsMap();
        return allCards[username] || [];
    }

    async saveCard(username, cardData) {
        const newCard = {
            id: this.generateUUID(),
            createdAt: Date.now(),
            nextReviewTime: Date.now(),
            ...cardData
        };

        if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
            if (!auth.currentUser) throw new Error("Not logged in");
            await db.collection('users').doc(auth.currentUser.uid).collection('cards').doc(newCard.id).set(newCard);
            return newCard;
        }
        if (this.useIndexedDB && window.FlipItDB) {
            await window.FlipItDB.addCard({ ...newCard, username });
            return newCard;
        }
        const allCards = this.getAllCardsMap();
        if (!allCards[username]) allCards[username] = [];
        allCards[username].push(newCard);
        this._set(STORAGE_KEYS.CARDS, JSON.stringify(allCards));
        return newCard;
    }

    async updateUser(currentUsername, newUsername, newPassword) {
        const users = await this.getUsers();

        if (newUsername && newUsername !== currentUsername) {
            if (users.find(u => u.username === newUsername)) {
                throw new Error('Username already taken');
            }
        }

        const userIndex = users.findIndex(u => u.username === currentUsername);
        if (userIndex === -1) throw new Error('User not found');

        const finalUsername = newUsername || currentUsername;
        const finalPassword = newPassword || users[userIndex].password;

        users[userIndex] = { username: finalUsername, password: finalPassword };
        if (this.useIndexedDB && window.FlipItDB) {
            await window.FlipItDB.setAllUsers(users);
        } else {
            this._set(STORAGE_KEYS.USERS, JSON.stringify(users));
        }

        if (newUsername && newUsername !== currentUsername) {
            if (this.useIndexedDB && window.FlipItDB) {
                const cards = await window.FlipItDB.getCardsByUsername(currentUsername);
                for (const c of cards) {
                    await window.FlipItDB.deleteCard(c.id);
                }
                for (const c of cards) {
                    await window.FlipItDB.addCard({ ...c, username: newUsername });
                }
            } else {
                const allCards = this.getAllCardsMap();
                if (allCards[currentUsername]) {
                    allCards[newUsername] = allCards[currentUsername];
                    delete allCards[currentUsername];
                    this._set(STORAGE_KEYS.CARDS, JSON.stringify(allCards));
                }
            }
            this.setCurrentUser(newUsername);
            return { username: newUsername, success: true };
        }

        return { username: currentUsername, success: true };
    }

    async updateCard(username, updatedCard) {
        if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
            if (!auth.currentUser) throw new Error("Not logged in");
            await db.collection('users').doc(auth.currentUser.uid).collection('cards').doc(updatedCard.id).update(updatedCard);
            return;
        }
        if (this.useIndexedDB && window.FlipItDB) {
            await window.FlipItDB.putCard({ ...updatedCard, username });
            return;
        }
        const allCards = this.getAllCardsMap();
        const userCards = allCards[username] || [];
        const index = userCards.findIndex(c => c.id === updatedCard.id);
        if (index !== -1) {
            userCards[index] = updatedCard;
            allCards[username] = userCards;
            this._set(STORAGE_KEYS.CARDS, JSON.stringify(allCards));
        }
    }

    async deleteCard(username, cardId) {
        if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
            if (!auth.currentUser) throw new Error("Not logged in");
            await db.collection('users').doc(auth.currentUser.uid).collection('cards').doc(cardId).delete();
            return;
        }
        if (this.useIndexedDB && window.FlipItDB) {
            await window.FlipItDB.deleteCard(cardId);
            return;
        }
        const allCards = this.getAllCardsMap();
        const userCards = (allCards[username] || []).filter(c => c.id !== cardId);
        allCards[username] = userCards;
        this._set(STORAGE_KEYS.CARDS, JSON.stringify(allCards));
    }

    async getDueCards(username) {
        if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
            if (!auth.currentUser) return [];
            const snapshot = await db.collection('users').doc(auth.currentUser.uid).collection('cards').get();
            const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const now = Date.now();
            return cards.filter(c => c.nextReviewTime <= now);
        }
        if (this.useIndexedDB && window.FlipItDB) {
            return window.FlipItDB.getDueCardsByUsername(username);
        }
        const cards = this.getAllCardsMap()[username] || [];
        const now = Date.now();
        return cards.filter(c => c.nextReviewTime <= now);
    }

    // --- Spaced Repetition Logic ---

    calcNextReview(card, intervalString) {
        const now = Date.now();
        let addMs = 0;

        switch (intervalString) {
            case '1m': addMs = 60 * 1000; break;
            case '5m': addMs = 5 * 60 * 1000; break;
            case '1h': addMs = 60 * 60 * 1000; break;
            case '1d': addMs = 24 * 60 * 60 * 1000; break;
            case '7d': addMs = 7 * 24 * 60 * 60 * 1000; break;
            case '30d': addMs = 30 * 24 * 60 * 60 * 1000; break;
            default: addMs = 60 * 1000; // Default 1 min
        }

        const updatedCard = { ...card };
        updatedCard.nextReviewTime = now + addMs;
        updatedCard.lastInterval = intervalString;
        return updatedCard;
    }
}

// ==========================================
// AUTH CLASS
// ==========================================
class Auth {
    constructor(store, callbacks) {
        this.store = store;
        this.onLoginSuccess = callbacks.onLoginSuccess;

        this.bindEvents();
    }

    bindEvents() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const linkToSignup = document.getElementById('link-to-signup');
        const linkToLogin = document.getElementById('link-to-login');

        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');

        linkToSignup.addEventListener('click', () => {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            this.clearErrors();
        });

        linkToLogin.addEventListener('click', () => {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            this.clearErrors();
        });

        btnLogin.addEventListener('click', () => this.handleLogin());
        btnSignup.addEventListener('click', () => this.handleSignup());
    }

    clearErrors() {
        document.getElementById('login-error').textContent = '';
        document.getElementById('signup-error').textContent = '';
    }

    async handleLogin() {
            const usernameInput = document.getElementById('login-username');
            const passwordInput = document.getElementById('login-password');
            const errorEl = document.getElementById('login-error');

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                errorEl.textContent = 'Please enter both username and password.';
                return;
            }

            try {
                await this.store.login(username, password);
                this.onLoginSuccess(username);
                usernameInput.value = '';
                passwordInput.value = '';
            } catch (e) {
                errorEl.textContent = e.message;
            }
        }

    async handleSignup() {
            const usernameInput = document.getElementById('signup-username');
            const passwordInput = document.getElementById('signup-password');
            const errorEl = document.getElementById('signup-error');

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                errorEl.textContent = 'Please fill in all fields.';
                return;
            }

            try {
                await this.store.register(username, password);
                this.onLoginSuccess(username);
                usernameInput.value = '';
                passwordInput.value = '';
            } catch (e) {
                errorEl.textContent = e.message || 'Error creating account.';
            }
        }
    }

// ==========================================
// REVIEW CLASS
// ==========================================
class Review {
    constructor(store, callbacks) {
        this.store = store;
        this.onExit = callbacks.onExit;

        this.currentCard = null;
        this.sessionCards = [];

        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('btn-show-hint').addEventListener('click', () => {
            document.getElementById('review-hint').classList.add('visible');
        });

        document.getElementById('btn-reveal-answer').addEventListener('click', () => {
            document.querySelector('.flashcard').classList.add('flipped');
            document.getElementById('btn-reveal-answer').classList.add('hidden');
            document.getElementById('rating-controls').classList.remove('hidden');
        });

        document.getElementById('btn-exit-review').addEventListener('click', () => {
            this.onExit();
        });

        document.getElementById('btn-export-current-card').addEventListener('click', () => {
            this.handleExportCurrentCard();
        });

        document.getElementById('btn-delete-card').addEventListener('click', () => {
            if (confirm("Are you sure you want to delete this card?")) {
                this.handleDelete();
            }
        });

        document.getElementById('btn-back-home-review').addEventListener('click', () => {
            this.onExit();
        });

        document.querySelector('.review-controls').addEventListener('click', (e) => {
            if (e.target.classList.contains('review-btn')) {
                const interval = e.target.dataset.interval;
                this.handleRate(interval);
            }
        });
    }

    async startSession() {
        const currentUser = this.store.getCurrentUser();
        this.sessionCards = await this.store.getDueCards(currentUser);
        this.showNextCard();
    }

    async handleDelete() {
        if (!this.currentCard) return;
        const currentUser = this.store.getCurrentUser();
        await this.store.deleteCard(currentUser, this.currentCard.id);
        this.sessionCards.shift();
        this.showNextCard();
    }

    handleExportCurrentCard() {
        if (!this.currentCard) return;
        const card = this.currentCard;
        const exportData = {
            app: 'FlipIt',
            exportedAt: new Date().toISOString(),
            card: {
                question: card.question,
                hint: card.hint || '',
                answer: card.answer,
                folder: card.folder || 'Uncategorized'
            }
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = (card.question || 'card').slice(0, 30).replace(/[^\w\s-]/g, '');
        a.download = `flipit-card-${safeName || 'export'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    showNextCard() {
        if (this.sessionCards.length === 0) {
            this.showEmptyState();
            return;
        }

        this.currentCard = this.sessionCards[0];
        this.renderCard(this.currentCard);
    }

    renderCard(card) {
        const cardEl = document.querySelector('.flashcard');
        cardEl.classList.remove('flipped');

        document.getElementById('review-empty-state').classList.add('hidden');
        document.getElementById('review-card').classList.remove('hidden');
        document.querySelector('.control-panel').classList.remove('hidden');
        document.getElementById('btn-delete-card').classList.remove('hidden');
        document.getElementById('btn-export-current-card').classList.remove('hidden');

        document.getElementById('review-question').textContent = card.question;
        document.getElementById('review-hint').textContent = card.hint || 'No hint available';
        document.getElementById('review-hint').classList.remove('visible');
        document.getElementById('review-answer').textContent = card.answer;

        document.getElementById('btn-reveal-answer').classList.remove('hidden');
        document.getElementById('rating-controls').classList.add('hidden');

        if (!card.hint) {
            document.getElementById('btn-show-hint').classList.add('hidden');
        } else {
            document.getElementById('btn-show-hint').classList.remove('hidden');
        }
    }

    async handleRate(interval) {
        const currentUser = this.store.getCurrentUser();
        const updatedCard = this.store.calcNextReview(this.currentCard, interval);
        await this.store.updateCard(currentUser, updatedCard);
        this.sessionCards.shift();
        this.showNextCard();
    }

    showEmptyState() {
        document.getElementById('review-card').classList.add('hidden');
        document.querySelector('.control-panel').classList.add('hidden');
        document.getElementById('btn-delete-card').classList.add('hidden');
        document.getElementById('btn-export-current-card').classList.add('hidden');
        document.getElementById('review-empty-state').classList.remove('hidden');
    }
}

// ==========================================
// MAIN APP CLASS
// ==========================================
class App {
    constructor() {
        this.store = new Store();
        this.auth = new Auth(this.store, {
            onLoginSuccess: (username) => this.showHome(username)
        });

        this.review = new Review(this.store, {
            onExit: () => {
                const user = this.store.getCurrentUser();
                this.showHome(user);
            }
        });

        this.init();
    }

    async init() {
        await this.store.init();
        this.bindGlobalEvents();

        if (localStorage.getItem('flipit_theme') === 'light') {
            document.body.classList.add('light-mode');
        }

        const currentUser = this.store.getCurrentUser();
        if (currentUser) {
            this.showHome(currentUser);
        } else {
            this.showAuth();
        }
    }

    bindGlobalEvents() {
        // ... previous events ...

        document.getElementById('btn-logout').addEventListener('click', () => {
            this.store.logout();
            this.showAuth();
        });

        document.getElementById('btn-create-view').addEventListener('click', () => {
            this.showCreate();
        });

        document.getElementById('btn-export-cards').addEventListener('click', () => {
            this.handleExportCards();
        });

        document.getElementById('btn-import-cards').addEventListener('click', () => {
            document.getElementById('input-import-file').click();
        });

        document.getElementById('input-import-file').addEventListener('change', (e) => {
            this.handleImportFile(e);
        });

        document.getElementById('btn-start-review').addEventListener('click', () => {
            this.showReview();
        });

        document.getElementById('btn-back-home-create').addEventListener('click', () => {
            const user = this.store.getCurrentUser();
            this.showHome(user);
        });

        // Settings & Theme
        document.getElementById('btn-settings').addEventListener('click', () => {
            this.showSettings();
            // Highlight active theme
            const isLight = document.body.classList.contains('light-mode');
            document.getElementById('btn-theme-light').classList.toggle('active-theme', isLight);
            document.getElementById('btn-theme-dark').classList.toggle('active-theme', !isLight);
        });

        document.getElementById('btn-back-home-settings').addEventListener('click', () => {
            const user = this.store.getCurrentUser();
            this.showHome(user);
        });

        document.getElementById('btn-theme-light').addEventListener('click', () => {
            document.body.classList.add('light-mode');
            localStorage.setItem('flipit_theme', 'light');
            document.getElementById('btn-theme-light').classList.add('active-theme');
            document.getElementById('btn-theme-dark').classList.remove('active-theme');
        });

        document.getElementById('btn-theme-dark').addEventListener('click', () => {
            document.body.classList.remove('light-mode');
            localStorage.setItem('flipit_theme', 'dark');
            document.getElementById('btn-theme-dark').classList.add('active-theme');
            document.getElementById('btn-theme-light').classList.remove('active-theme');
        });

        document.getElementById('btn-save-card').addEventListener('click', () => {
            this.handleCreateCard();
        });

        document.getElementById('btn-update-account').addEventListener('click', () => {
            this.handleUpdateAccount();
        });

    }

    hideAllViews() {
        document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    }

    showAuth() {
        this.hideAllViews();
        document.getElementById('auth-view').classList.remove('hidden');
    }

    showHome(username) {
        this.hideAllViews();
        document.getElementById('home-view').classList.remove('hidden');
        document.getElementById('user-display-name').textContent = username;
        this.updateStats(username); // async
    }

    showSettings() {
        this.hideAllViews();
        document.getElementById('settings-view').classList.remove('hidden');
    }

    showCreate() {
        this.hideAllViews();
        document.getElementById('create-view').classList.remove('hidden');
        document.getElementById('card-question').value = '';
        document.getElementById('card-hint').value = '';
        document.getElementById('card-answer').value = '';
        document.getElementById('card-folder').value = '';
        document.getElementById('create-msg').textContent = '';
    }

    showReview() {
        this.hideAllViews();
        document.getElementById('review-view').classList.remove('hidden');
        this.review.startSession(); // async
    }

    async handleExportCards() {
        const username = this.store.getCurrentUser();
        if (!username) return;
        const cards = await this.store.getUserCards(username);
        const exportData = {
            app: 'FlipIt',
            exportedAt: new Date().toISOString(),
            username,
            count: cards.length,
            cards: cards.map(c => ({
                question: c.question,
                hint: c.hint || '',
                answer: c.answer,
                folder: c.folder || 'Uncategorized'
            }))
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flipit-flashcards-${username}-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async handleImportFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        const username = this.store.getCurrentUser();
        if (!username) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            let toImport = [];
            if (data.cards && Array.isArray(data.cards)) {
                toImport = data.cards;
            } else if (data.card && typeof data.card === 'object') {
                toImport = [data.card];
            } else {
                alert('Invalid file. Use a FlipIt export JSON.');
                return;
            }
            let imported = 0;
            for (const c of toImport) {
                const question = c.question || c.q;
                const answer = c.answer || c.a;
                if (!question || !answer) continue;
                await this.store.saveCard(username, {
                    question,
                    hint: c.hint || '',
                    answer,
                    folder: c.folder || 'Uncategorized'
                });
                imported++;
            }
            await this.updateStats(username);
            alert(imported > 0 ? `Imported ${imported} card(s).` : 'No valid cards found in file.');
        } catch (err) {
            alert('Could not import file. Use a valid FlipIt JSON export.');
        }
    }

    // toggleTheme removed in favor of explicit buttons


    async updateStats(username) {
        const [cards, due] = await Promise.all([
            this.store.getUserCards(username),
            this.store.getDueCards(username)
        ]);
        document.getElementById('stat-total').textContent = cards.length;
        document.getElementById('stat-due').textContent = due.length;
    }

    async handleCreateCard() {
        const username = this.store.getCurrentUser();
        const q = document.getElementById('card-question').value.trim();
        const h = document.getElementById('card-hint').value.trim();
        const a = document.getElementById('card-answer').value.trim();

        if (!q || !a) {
            alert('Please enter a Question and Answer.\n(Hint is optional)');
            return;
        }

        await this.store.saveCard(username, {
            question: q,
            hint: h,
            answer: a,
            folder: document.getElementById('card-folder').value.trim() || 'Uncategorized'
        });

        document.getElementById('create-msg').textContent = 'Card Saved Successfully!';
        document.getElementById('card-question').value = '';
        document.getElementById('card-hint').value = '';
        document.getElementById('card-answer').value = '';
        setTimeout(() => {
            document.getElementById('create-msg').textContent = '';
        }, 2000);
    }

    async handleUpdateAccount() {
        const usernameInput = document.getElementById('update-username');
        const passwordInput = document.getElementById('update-password');
        const msgEl = document.getElementById('update-msg');

        const newUsername = usernameInput.value.trim();
        const newPassword = passwordInput.value.trim();
        const currentUsername = this.store.getCurrentUser();

        if (!newUsername && !newPassword) {
            msgEl.textContent = 'Nothing to update.';
            msgEl.style.color = 'var(--text-muted)';
            return;
        }

        try {
            const result = await this.store.updateUser(currentUsername, newUsername, newPassword);
            if (result.success) {
                msgEl.textContent = 'Account updated successfully!';
                msgEl.style.color = 'var(--success)';

                // Clear inputs
                usernameInput.value = '';
                passwordInput.value = '';

                if (newUsername) {
                    // If username changed, update UI immediately
                    document.getElementById('user-display-name').textContent = newUsername;
                }
            }
        } catch (e) {
            msgEl.textContent = e.message;
            msgEl.style.color = 'var(--error)';
        }
    }
}

// Initialize
window.app = new App();
