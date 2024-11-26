// Import required modules and libraries
import Cookies from "https://cdn.jsdelivr.net/npm/js-cookie@3/dist/js.cookie.min.mjs"; // Cookie management
import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"; // Firestore methods
import { db, validateAuthToken } from './Login.js'; // Firebase app setup and validation

// Handle DOMContentLoaded Event
document.addEventListener("DOMContentLoaded", async () => {
    const email = Cookies.get('userEmail');
    const isValid = await validateAuthToken();

    if (!isValid || !email) {
        alert("You are not authorized. Redirecting to the login page.");
        window.location.href = "/"; // Redirect to login/home page
        return;
    }

    try {
        // Extract quizId and quizName from the URL
        const urlHash = window.location.hash.substring(1); // Removes the '#' character
        const parts = urlHash.split('#'); // Split based on all '#'

        if (parts.length < 2) {
            alert("Invalid URL format. Please check the URL.");
            return;
        }

        const quizId = parts[0].replace('quiz_', ''); // Extract quiz ID (removing 'quiz_' prefix)
        const quizName = decodeURIComponent(parts[1]); // Decode and assign the quiz name

        if (!quizId || !quizName) {
            alert("Invalid quiz ID or quiz name. Please check the URL.");
            return;
        }

        // Assign quizName to the element with id="quizName"
        const quizNameElement = document.getElementById('quizName');
        if (quizNameElement) {
            quizNameElement.textContent = quizName || 'Quiz Name Not Available';
        }

        // Query Firestore for results with the provided quizId
        const resultsRef = collection(db, 'results');
        const resultsQuery = query(resultsRef, where("quizId", "==", `quiz_${quizId}`));
        const resultsSnapshot = await getDocs(resultsQuery);

        if (resultsSnapshot.empty) {
            alert("No results found for this quiz.");
            return;
        }

        // Populate the results table
        const tbody = document.getElementById('results').querySelector('tbody');
        tbody.innerHTML = ""; // Clear existing rows

        resultsSnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.classList.add('has-text-centered');

            row.innerHTML = `
                <td>${data.userName || 'N/A'}</td>
                <td>${data.userEmail || 'N/A'}</td>
                <td>${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : 'N/A'}</td>
                <td>${data.timeTaken ? data.timeTaken + ' Minutes' : 'N/A'}</td>
                <td>${data.score ? data.score + ' / 100' : 'N/A'}</td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching results:", error);
        alert("Failed to load results. Please try again.");
    }
});