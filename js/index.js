import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDloZmh4z0P6wL3vOp-T5ivM5gUcRNY_jk",
        authDomain: "country-flag-quiz-81284.firebaseapp.com",
        projectId: "country-flag-quiz-81284",
        storageBucket: "country-flag-quiz-81284.appspot.com",
        messagingSenderId: "600529258048",
        appId: "1:600529258048:web:4fd72b70a94f51077581a5",
        measurementId: "G-6GV8HZ4B8N"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // DOM Elements
    const highestScoreEasy = document.getElementById('highestScoreEasy');
    const highestScoreMedium = document.getElementById('highestScoreMedium');
    const highestScoreHard = document.getElementById('highestScoreHard');
    const register = document.getElementById('register');
    const login = document.getElementById('login');
    const rmodal = document.getElementById('rmodal');
    const lmodal = document.getElementById('lmodal');

    // Event Listeners for Modal Open/Close
    login.addEventListener("click", () => lmodal.classList.add('is-active'));
    register.addEventListener("click", () => rmodal.classList.add('is-active'));
    rmodal.querySelector('.delete').addEventListener('click', () => rmodal.classList.remove('is-active'));
    lmodal.querySelector('.delete').addEventListener('click', () => lmodal.classList.remove('is-active'));

    // Load Scores from Local Storage
    const highestEasy = parseInt(localStorage.getItem("highestScoreEasy") || 0);
    const highestMedium = parseInt(localStorage.getItem("highestScoreMedium") || 0);
    const highestHard = parseInt(localStorage.getItem("highestScoreHard") || 0);

    highestScoreEasy.innerHTML = highestEasy;
    highestScoreMedium.innerHTML = highestMedium;
    highestScoreHard.innerHTML = highestHard;

    // Registration Handler
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
            });

            alert("Registration successful!");
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // Login Handler
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            alert("Login successful!");
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // Google Login Handler
    const googleLogin = async () => {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                // Save user data in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    name: user.displayName,
                    email: user.email,
                });
            }

            alert("Login successful with Google!");
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Attach Google Login Event
    document.querySelectorAll('.googleSignInBtn').forEach((btn) => {
        btn.addEventListener('click', googleLogin);
    });
});