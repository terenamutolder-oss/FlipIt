// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
// TODO: Replace with your actual Firebase project configuration
// 1. Go to https://console.firebase.google.com/
// 2. Create a project named "FlipIt"
// 3. Add a Web App (</>)
// 4. Copy the config object below

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db;
let auth;
let isFirebaseInitialized = false;

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        isFirebaseInitialized = true;
        console.log("Firebase initialized successfully");
    } else {
        console.warn("Firebase config missing. Using LocalStorage fallback.");
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
}
