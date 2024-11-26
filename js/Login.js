import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import Cookies from "https://cdn.jsdelivr.net/npm/js-cookie@3/dist/js.cookie.min.mjs"; // Use js-cookie library for cookie management

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Modal Elements
const register = document.getElementById('register');
const login = document.getElementById('login');
const rmodal = document.getElementById('rmodal');
const lmodal = document.getElementById('lmodal');

// Event Listeners for Modal Open/Close
login.addEventListener("click", () => lmodal.classList.add('is-active'));
register.addEventListener("click", () => rmodal.classList.add('is-active'));
rmodal.querySelector('.delete').addEventListener('click', () => rmodal.classList.remove('is-active'));
lmodal.querySelector('.delete').addEventListener('click', () => lmodal.classList.remove('is-active'));

// Get the navbar burger and menu elements
const navbarBurger = document.querySelector(".navbar-burger");
const navbarMenu = document.querySelector(".navbar-menu");

// Check for click events on the navbar burger icon
navbarBurger.addEventListener("click", function () {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    navbarBurger.classList.toggle("is-active");
    navbarMenu.classList.toggle("is-active");
});


const setAuthToken = async (user) => {
    const token = await user.getIdToken(); // Get Firebase ID token
    const email = user.email; // Get the user's email

    // Set the auth token in cookies
    Cookies.set('authToken', token, { expires: 1, secure: true, sameSite: 'Strict' });

    // Set the email in cookies
    Cookies.set('userEmail', email, { expires: 1, secure: true, sameSite: 'Strict' });
};


// Function to Validate Auth Token
const validateAuthToken = async () => {
    const token = Cookies.get('authToken');
    if (!token) return false;

    try {
        const user = await new Promise((resolve, reject) => {
            onAuthStateChanged(auth, (user) => {
                if (user) resolve(user);
                else reject("User not authenticated");
            });
        });
        return true;
    } catch (error) {
        Cookies.remove('authToken');
        Cookies.remove('userEmail');
        return false;
    }
};

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
        await setDoc(doc(db, "users", user.uid), { name, email });
        await setAuthToken(user); // Set authentication token
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

        await setAuthToken(user); // Set authentication token
        alert("Login successful!");
        document.getElementById('lmodal').querySelector('.delete').click();
        setButtons();
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
            await setDoc(doc(db, "users", user.uid), { name: user.displayName, email: user.email });
        }

        await setAuthToken(user); // Set authentication token
        alert("Login successful with Google!");
        document.getElementById('lmodal').querySelector('.delete').click();
        setButtons();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};

// Logout Handler
const logout = async () => {
    try {
        await signOut(auth);
        Cookies.remove('authToken'); // Clear authentication token
        Cookies.remove('userEmail'); // Clear email cookie
        alert("Logout successful!");
        setButtons();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};


// Attach Event Listeners
document.querySelectorAll('.googleSignInBtn').forEach((btn) => {
    btn.addEventListener('click', googleLogin);
});
document.getElementById('logoutBtn').addEventListener('click', logout);



async function setButtons() {
    console.log("called");

    try {
        const isValid = await validateAuthToken(); // Check if the token is valid
        const buttonContainer = document.getElementById('normal'); // Container for login/register buttons
        const logoutBtn = document.getElementById('logoutBtn'); // Logout button
        const createQ = document.getElementById('createQ');

        if (isValid) {
            buttonContainer.classList.add('is-hidden');
            logoutBtn.classList.remove('is-hidden');
            createQ.classList.remove('is-hidden');
        } else {
            buttonContainer.classList.remove('is-hidden');
            logoutBtn.classList.add('is-hidden');
            createQ.classList.add('is-hidden');
        }
    } catch (error) {
        document.getElementById('normal').classList.remove('is-hidden');
        document.getElementById('logoutBtn').classList.add('is-hidden');
    }
}


// Validate Auth Token on Page Load
setButtons();

export { app, db, auth, validateAuthToken };