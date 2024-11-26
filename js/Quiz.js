// Import required modules and libraries
import Cookies from "https://cdn.jsdelivr.net/npm/js-cookie@3/dist/js.cookie.min.mjs"; // Cookie management
import {
    collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"; // Firestore methods
import { db } from './Login.js';

document.addEventListener("DOMContentLoaded", async () => {

    // Extract Quiz ID from the URL
    const quizId = getQuizIdFromUrl();
    if (!quizId) {
        alert("Quiz ID is missing in the URL. Redirecting to the home page.");
        window.location.href = "/";
        return;
    }

    // Fetch and display quiz data
    await loadQuizData(quizId);
});

// Function to extract Quiz ID from the URL
function getQuizIdFromUrl() {
    const hash = window.location.hash.substring(1);
    return hash.startsWith('quiz_') ? hash : null;
}

// Function to fetch quiz data from Firestore
async function loadQuizData(quizId) {
    try {
        const quizzesRef = collection(db, 'quizzes');
        const q = query(quizzesRef, where('quizId', '==', quizId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Quiz not found. Redirecting to the home page.");
            window.location.href = "/";
            return;
        }

        querySnapshot.forEach(doc => {
            const quizData = doc.data();
            renderQuizData(quizData);
        });
    } catch (error) {
        console.error("Error fetching quiz data:", error);
        alert("An error occurred while loading the quiz. Please try again.");
    }
}

// Function to dynamically render quiz data on the page
function renderQuizData(quizData) {

    document.getElementById('quizName').innerHTML = quizData.quizName || "Unknown Quiz Name";
    document.getElementById('organiserName').innerHTML = quizData.organiserName || "Unknown Organiser";
    document.getElementById('noOfQuestions').innerHTML = quizData.noOfQuestions || "0";
    document.getElementById('quizTime').innerHTML = `${quizData.quizTime || "0"} minutes`;
    document.getElementById('continent').innerHTML = quizData.continent || "All";
    document.getElementById('difficultyLevel').innerHTML = quizData.difficultyLevel || "Unknown";
    document.getElementById('quizType').innerHTML = quizData.quizType || "Unknown";
}