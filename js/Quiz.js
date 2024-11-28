import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db } from './Login.js';

let startTime;
let quizData;

document.addEventListener("DOMContentLoaded", async () => {
    function getQuizIdFromUrl() {
        const hash = window.location.hash.substring(1);
        return hash.startsWith('quiz_') ? hash : null;
    }

    const filterAndLimitData = (data, continent, level) => {
        // Get the data for the specified continent, or all continents if "All" is selected
        let filteredData = continent === "All" ? Object.values(data).flat() : data[continent] || [];

        // Shuffle the filtered data
        filteredData = shuffleArray(filteredData);

        // Filter data based on the level and add fallback logic
        let result = [];
        const numberOfQuestions = quizData.noOfQuestions;

        if (level === "Easy") {
            result = filteredData.filter(item => item.preference === 1);
            if (result.length < numberOfQuestions) {
                const additionalData = filteredData.filter(item => item.preference !== 1).slice(0, numberOfQuestions - result.length);
                result = result.concat(additionalData);
            }
        } else if (level === "Medium") {
            result = filteredData.filter(item => item.preference === 2);
            if (result.length < numberOfQuestions) {
                const additionalData = filteredData.filter(item => item.preference !== 2).slice(0, numberOfQuestions - result.length);
                result = result.concat(additionalData);
            }
        } else if (level === "Hard") {
            result = filteredData.filter(item => item.preference === 3).slice(0, numberOfQuestions);
        }

        return result.slice(0, numberOfQuestions); // Ensure the result is limited to the number of questions
    };

    const prepareQuestions = () => {
        const continent = quizData.continent || "All";
        const difficultyLevel = quizData.difficultyLevel || "Easy";
        return filterAndLimitData(data, continent, difficultyLevel);
    };


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
                quizData = doc.data();
                renderQuizData(quizData);
            });

            document.querySelector('.loader').classList.add('is-hidden');
        } catch (error) {
            console.error("Error fetching quiz data:", error);
            alert("An error occurred while loading the quiz. Please try again.");
        }
    }

    function renderQuizData(data) {
        document.getElementById('quizName').textContent = data.quizName || "Unknown Quiz Name";
        document.getElementById('organiserName').textContent = data.organiserName || "Unknown Organiser";
        document.getElementById('noOfQuestions').textContent = data.noOfQuestions || "0";
        document.getElementById('quizTime').textContent = `${data.quizTime || "0"} minutes`;
        document.getElementById('continent').textContent = data.continent || "All";
        document.getElementById('difficultyLevel').textContent = data.difficultyLevel || "Unknown";
        document.getElementById('quizType').textContent = data.quizType || "Unknown";
    }

    const quizId = getQuizIdFromUrl();
    if (!quizId) {
        alert("Quiz ID is missing in the URL. Redirecting to the home page.");
        window.location.href = "/";
        return;
    }

    await loadQuizData(quizId);

    const playNowBtn = document.getElementById("playNowBtn");
    const gameArea = document.getElementById("gameArea");
    const startArea = document.getElementById("startArea");
    const optionsContainer = document.getElementById("optionsContainer");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const questionNumber = document.getElementById('questionnumber');
    const flagImage = document.getElementById("flagImage");
    const question = document.getElementById("question");
    const remainingTime = document.getElementById("remainingTime");
    const userEmail = document.getElementById('userEmail');
    const userName = document.getElementById('userName');

    let questionNo = 0;
    let currentData = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer = parseInt(quizData.quizTime) * 60 || 30 * 60;
    let interval;

    let data = {};
    try {
        data = await fetch("../data/countries.json").then(res => res.json());
    } catch (error) {
        console.error("Error fetching country data:", error);
    }

    const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

    const loadQuestions = (allQuestions, numberOfQuestions) => {
        const shuffledQuestions = shuffleArray(allQuestions);
        return shuffledQuestions.slice(0, numberOfQuestions);
    };

    const generateOptions = (correctAnswer, allCountries) => {
        const options = new Set([correctAnswer]);
        while (options.size < 4) {
            const randomCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
            options.add(randomCountry.name);
        }
        return shuffleArray([...options]);
    };

    const renderQuestion = () => {
        if (currentQuestionIndex >= currentData.length) {
            resetGame();
            return;
        }

        questionNo++;
        questionNumber.innerHTML = `<span class="has-text-success">${questionNo}</span> of <span class="has-text-warning">${currentData.length}</span>`;

        const currentCountry = currentData[currentQuestionIndex];
        const allCountries = Object.values(data).flat();
        const options = generateOptions(currentCountry.name, allCountries);

        optionsContainer.innerHTML = "";

        if (quizData.quizType === 'Flag') {
            // Display country name as the question
            question.innerHTML = `Which flag belongs to <span class="has-text-primary">${currentCountry.name}</span>?`;
            question.classList.remove('is-hidden');
            flagImage.classList.add('is-hidden');

            // Generate flag options
            options.forEach(option => {
                const country = allCountries.find(c => c.name === option);
                const img = document.createElement("img");
                img.src = `../assets/Flag Images/${country.img}`;
                img.alt = `${country.name} Flag`;
                img.className = "flagimg";

                const btn = document.createElement("button");
                btn.className = "button is-large is-outlined is-fullwidth option-btn";
                btn.appendChild(img);

                // Pass the selected option (country name) to handleOptionSelection
                btn.addEventListener("click", () => handleOptionSelection(btn, currentCountry.name, option));

                const column = document.createElement("div");
                column.classList.add("column", "is-6");
                column.appendChild(btn);
                optionsContainer.appendChild(column);
            });
        } else {
            // Display flag image as the question
            flagImage.src = `../assets/Flag Images/${currentCountry.img}`;
            flagImage.alt = `${currentCountry.name} Flag`;
            flagImage.classList.remove('is-hidden');
            question.classList.add('is-hidden');

            // Generate text options
            options.forEach(option => {
                const btn = document.createElement("button");
                btn.className = "button is-large is-outlined is-fullwidth option-btn";
                btn.textContent = option;

                // Pass the selected option to handleOptionSelection
                btn.addEventListener("click", () => handleOptionSelection(btn, currentCountry.name, option));

                const column = document.createElement("div");
                column.classList.add("column", "is-6");
                column.appendChild(btn);
                optionsContainer.appendChild(column);
            });
        }


        nextBtn.style.display = "none";
        submitBtn.style.display = (currentQuestionIndex === currentData.length - 1) ? "block" : "none";
    };

    const handleOptionSelection = (button, correctAnswer, selectedOption) => {
        // Clear any previously selected option
        optionsContainer.querySelectorAll("button").forEach(btn => {
            btn.classList.remove("is-primary");
        });
        button.classList.add("is-primary");

        // Show the next button if more questions remain
        nextBtn.style.display = (currentQuestionIndex < currentData.length - 1) ? "block" : "none";

        // Determine the user's selection and update the score
        if (quizData.quizType === 'Flag') {
            // For flag-based questions, compare the selected option (country name) with the correct answer
            if (selectedOption === correctAnswer) {
                score += 100 / currentData.length;
            }
        } else {
            // For text-based questions, compare button text directly
            if (button.textContent === correctAnswer) {
                score += 100 / currentData.length;
            }
        }
    };


    const resetGame = () => {
        questionNo = 0;
        currentQuestionIndex = 0;
        score = 0;
        timer = parseInt(quizData.quizTime) * 60 || 30 * 60;
        remainingTime.textContent = formatTime(timer);
        gameArea.classList.add('is-hidden');
        startArea.classList.remove('is-hidden');
        userEmail.value = "";
        userName.value = "";
        clearInterval(interval);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const startTimer = () => {
        interval = setInterval(() => {
            timer--;
            remainingTime.textContent = formatTime(timer);
            if (timer <= 0) {
                clearInterval(interval);
                alert(`Time's up! Your Score: ${Math.round(score)}`);
                resetGame();
            }
        }, 1000);
    };

    playNowBtn.addEventListener("click", () => {
        if (userName.value.trim() && userEmail.value.trim()) {
            currentData = prepareQuestions();
            startArea.classList.add('is-hidden');
            gameArea.classList.remove('is-hidden');
            startTime = new Date();
            renderQuestion();
            startTimer();
        } else {
            alert("Please enter your name and email to start the quiz.");
        }
    });

    nextBtn.addEventListener("click", () => {
        currentQuestionIndex++;
        renderQuestion();
    });

    submitBtn.addEventListener("click", async () => {
        try {
            submitBtn.disabled = true;
            const endTime = new Date();
            const timeTakenInSeconds = Math.floor((endTime - startTime) / 1000);
            const minutes = Math.floor(timeTakenInSeconds / 60);
            const seconds = timeTakenInSeconds % 60;
            const formattedTimeTaken = `${minutes} minutes and ${seconds} seconds`;

            await addDoc(collection(db, 'results'), {
                quizId: quizId,
                userName: userName.value.trim(),
                userEmail: userEmail.value.trim(),
                timestamp: serverTimestamp(),
                score: Math.round(score),
                timeTaken: formattedTimeTaken,
            });
            clearInterval(interval);
            alert(`Quiz Submitted! Time Taken: ${formattedTimeTaken}`);
            resetGame();
        } catch (error) {
            console.error("Error submitting quiz results:", error);
        }
    });


});