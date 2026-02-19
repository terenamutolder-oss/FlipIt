/**
 * FlipIt - IndexedDB Database Layer
 * Database: FlipItDB
 * Stores: users (username), cards (id) with username index for per-user isolation
 */
const DB_NAME = 'FlipItDB';
const DB_VERSION = 1;
const STORE_USERS = 'users';
const STORE_CARDS = 'cards';

let dbInstance = null;

function openDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
            dbInstance = req.result;
            resolve(dbInstance);
        };
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_USERS)) {
                db.createObjectStore(STORE_USERS, { keyPath: 'username' });
            }
            if (!db.objectStoreNames.contains(STORE_CARDS)) {
                const cardStore = db.createObjectStore(STORE_CARDS, { keyPath: 'id' });
                cardStore.createIndex('username', 'username', { unique: false });
                cardStore.createIndex('nextReviewTime', 'nextReviewTime', { unique: false });
            }
        };
    });
}

const flipitIdb = {
    async init() {
        try {
            await openDB();
            return true;
        } catch (e) {
            console.error('IndexedDB init failed:', e);
            return false;
        }
    },

    async getUsers() {
        const conn = await openDB();
        return new Promise((resolve, reject) => {
            const tx = conn.transaction(STORE_USERS, 'readonly');
            const store = tx.objectStore(STORE_USERS);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    },

    async addUser(user) {
        const conn = await openDB();
        return new Promise((resolve, reject) => {
            const tx = conn.transaction(STORE_USERS, 'readwrite');
            const store = tx.objectStore(STORE_USERS);
            const req = store.add(user);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async putUser(user) {
        const conn = await openDB();
        return new Promise((resolve, reject) => {
            const tx = conn.transaction(STORE_USERS, 'readwrite');
            const store = tx.objectStore(STORE_USERS);
            const req = store.put(user);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async setAllUsers(users) {
        const conn = await openDB();
        return new Promise((resolve, reject) => {
            const tx = conn.transaction(STORE_USERS, 'readwrite');
            const store = tx.objectStore(STORE_USERS);
            store.clear();
            users.forEach(u => store.add(u));
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async getCardsByUsername(username) {
        const conn = await openDB();
        return new Promise((resolve, reject) => {
            const tx = conn.transaction(STORE_CARDS, 'readonly');
            const store = tx.objectStore(STORE_CARDS);
            const index = store.index('username');
            const req = index.getAll(username);
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    },

    async getDueCardsByUsername(username, now = Date.now()) {
        const cards = await this.getCardsByUsername(username);
        return cards.filter(c => c.nextReviewTime <= now);
    },

    async addCard(card) {
        const conn = await openDB();
        return new Promise((resolve, reject) => {
            const tx = conn.transaction(STORE_CARDS, 'readwrite');
            const store = tx.objectStore(STORE_CARDS);
            const req = store.add(card);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async putCard(card) {
        const conn = await openDB();
        return new Promise((resolve, reject) => {
            const tx = conn.transaction(STORE_CARDS, 'readwrite');
            const store = tx.objectStore(STORE_CARDS);
            const req = store.put(card);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async deleteCard(cardId) {
        const conn = await openDB();
        return new Promise((resolve, reject) => {
            const tx = conn.transaction(STORE_CARDS, 'readwrite');
            const store = tx.objectStore(STORE_CARDS);
            const req = store.delete(cardId);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async replaceCardsForUser(username, cards) {
        const conn = await openDB();
        const existing = await this.getCardsByUsername(username);
        return new Promise((resolve, reject) => {
            const tx = conn.transaction(STORE_CARDS, 'readwrite');
            const store = tx.objectStore(STORE_CARDS);
            existing.forEach(c => store.delete(c.id));
            cards.forEach(c => store.add({ ...c, username }));
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
};

// Expose for Store to use (avoid global "db" so Firebase can use it)
window.FlipItDB = flipitIdb;
