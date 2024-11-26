// Import required modules and libraries
import Cookies from "https://cdn.jsdelivr.net/npm/js-cookie@3/dist/js.cookie.min.mjs"; // Cookie management
import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"; // Firestore methods
import { db, validateAuthToken } from './Login.js'; // Firebase app setup and validation

// Handle Form Submission
document.getElementById('quizForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    // Get Form Values
    const quizName = document.getElementById('quizName').value.trim();
    const noOfQuestions = parseInt(document.getElementById('noOfQuestions').value.trim());
    const quizTime = parseInt(document.getElementById('quizTime').value.trim());
    const continent = document.getElementById('continent').value;
    const difficultyLevel = document.getElementById('level').value;
    const quizType = document.getElementById('type').value;
    const organiserName = document.getElementById('organiserName').value.trim();

    // Validate Input
    if (!quizName || isNaN(noOfQuestions) || isNaN(quizTime) || !organiserName) {
        alert("Please provide valid input for all fields.");
        return;
    }

    try {
        // Get authToken and user email from cookies
        const email = Cookies.get('userEmail');
        const isValid = await validateAuthToken();

        if (!isValid || !email) {
            alert("Authentication token not found or invalid. Please log in again.");
            return;
        }

        // Generate a unique Quiz ID
        const quizId = `quiz_${Date.now()}`;

        // Create Quiz Object
        const quizData = {
            quizId,
            quizName,
            noOfQuestions,
            quizTime,
            continent,
            difficultyLevel,
            quizType,
            organiserName,
            createdBy: email,
            createdAt: serverTimestamp()
        };

        // Save to Firestore
        await addDoc(collection(db, 'quizzes'), quizData);

        alert("Quiz created successfully!");
        // Optionally, reset the form
        document.getElementById('quizForm').reset();
    } catch (error) {
        console.error("Error creating quiz:", error);
        alert("Failed to create quiz. Please try again.");
    }
});

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
        // Fetch quizzes created by the current user
        const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
        const quizzes = [];
        quizzesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.createdBy === email) {
                quizzes.push({ id: doc.id, ...data });
            }
        });

        // Populate the table with quizzes
        const tbody = document.getElementById('quizzes').querySelector('tbody');
        tbody.innerHTML = ""; // Clear existing rows

        quizzes.forEach((quiz) => {
            const row = document.createElement('tr');
            row.classList.add('has-text-centered');

            // Get the base path of the current page dynamically
            const basePath = window.location.pathname.split('/').slice(0, -1).join('/');

            row.innerHTML = `
    <td>${quiz.quizName}</td>
    <td><a href="${window.location.origin}${basePath}/Quiz.html#${quiz.quizId}" target="_blank">${window.location.origin}${basePath}/Quiz.html#${quiz.quizId}</a></td>
    <td class="buttons">
        <button class="button is-danger is-small delquiz" data-id="${quiz.id}">Delete</button>
        <button class="button is-primary is-small"><a class="has-text-black" href="${window.location.origin}${basePath}/Result.html#${quiz.quizId}#${quiz.quizName}" target="_blank">View Results</a></button>
    </td>
`;



            tbody.appendChild(row);
        });

        // Add delete functionality
        document.querySelectorAll('.delquiz').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const quizId = e.target.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this quiz?")) {
                    try {
                        await deleteDoc(doc(db, 'quizzes', quizId));
                        alert("Quiz deleted successfully!");
                        e.target.closest('tr').remove(); // Remove row from table
                    } catch (error) {
                        console.error("Error deleting quiz:", error);
                        alert("Failed to delete quiz. Please try again.");
                    }
                }
            });
        });
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        alert("Failed to load quizzes. Please try again.");
    }
});