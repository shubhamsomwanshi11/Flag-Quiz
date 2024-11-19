document.addEventListener("DOMContentLoaded", async () => {
    const playNowBtn = document.getElementById("playNowBtn");
    const gameArea = document.getElementById("gameArea");
    const startArea = document.getElementById("startArea");
    const optionsContainer = document.getElementById("optionsContainer");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const scoreElement = document.getElementById("score");
    const remainingTime = document.getElementById("remainingTime");
    const continent = document.getElementById("continent");
    const timedQuiz = document.getElementById("timedQuiz");
    const level = document.getElementById("level");
    const questionNumber = document.getElementById('questionnumber');
    const highestScoreEasy = document.getElementById('highestScoreEasy');
    const highestScoreMedium = document.getElementById('highestScoreMedium');
    const highestScoreHard = document.getElementById('highestScoreHard');

    let highestEasy = parseInt(localStorage.getItem("highestScoreEasy") || 0);
    let highestMedium = parseInt(localStorage.getItem("highestScoreMedium") || 0);
    let highestHard = parseInt(localStorage.getItem("highestScoreHard") || 0);

    let questionNo = 0;
    let data = {};
    let currentData = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer = 30 * 60; // 30 minutes in seconds
    let interval;

    // Update displayed highest scores
    const updateHighestScoresDisplay = () => {
        highestScoreEasy.textContent = Math.round(highestEasy);
        highestScoreMedium.textContent = Math.round(highestMedium);
        highestScoreHard.textContent = Math.round(highestHard);
    };

    // Fetch country data
    try {
        data = await fetch("../data/countries.json").then((res) => res.json());
    } catch (error) {
        console.error("Error fetching country data:", error);
    }

    // Shuffle an array
    const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

    // Generate options with flag images
    const generateOptions = (correctAnswer, allCountries) => {
        const options = new Set([correctAnswer]);
        while (options.size < 4) {
            const randomCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
            options.add(randomCountry);
        }
        return shuffleArray([...options]);
    };

    // Render the current question
    const renderQuestion = () => {
        questionNo++;
        if (currentQuestionIndex >= currentData.length) {
            questionNo = 0;
            alert("Quiz Completed! Your Score: " + score);
            updateHighestScore();
            resetGame();
            return;
        }

        questionNumber.innerHTML = `<span class="has-text-success">${questionNo}</span> of <span class="has-text-warning">${currentData.length}</span>`;
        const currentCountry = currentData[currentQuestionIndex];
        const allCountries = Object.values(data).flat();
        const options = generateOptions(currentCountry, allCountries);

        // Display the country name as the question
        document.getElementById("question").innerHTML = `
            <h2 class="is-size-4 has-text-weight-bold has-text-centered mb-4">
                Which flag belongs to <span class="has-text-primary">${currentCountry.name}</span>?
            </h2>`;

        // Generate flag image options
        optionsContainer.innerHTML = "";
        options.forEach((option) => {
            const btn = document.createElement("button");
            btn.className = "button is-large is-outlined is-fullwidth option-btn flag-option";
            btn.disabled = false;
            btn.addEventListener("click", () => checkAnswer(option.name, currentCountry.name, btn));

            // Add the flag image to the button
            const img = document.createElement("img");
            img.src = `../assets/Flag Images/${option.img}`;
            img.alt = `${option.name} Flag`;
            img.className = "flagimg";

            btn.appendChild(img);

            const column = document.createElement("div");
            column.classList.add("column", "is-6");
            column.appendChild(btn);
            optionsContainer.appendChild(column);
        });

        // Hide the Next button until an answer is selected
        nextBtn.style.display = "none";
    };

    // Check the answer
    const checkAnswer = (selectedOption, correctAnswer, button) => {
        const buttons = optionsContainer.querySelectorAll(".flag-option");

        // Disable all options after selection
        buttons.forEach((btn) => (btn.disabled = true));

        if (selectedOption === correctAnswer) {
            button.classList.add("is-success");

            // Calculate score increment based on the number of questions
            const totalMarks = 100;
            const scoreIncrement = totalMarks / currentData.length;

            score += scoreIncrement;
            scoreElement.textContent = Math.round(score);
        } else {
            button.classList.add("is-danger");
            // Highlight the correct option
            buttons.forEach((btn) => {
                const img = btn.querySelector("img");
                if (img.alt.includes(correctAnswer)) {
                    btn.classList.add("is-success");
                }
            });
        }

        // Show the Next button
        nextBtn.style.display = "block";
    };

    // Update highest score based on level
    const updateHighestScore = () => {
        if (level.value === "Easy" && score > highestEasy) {
            highestEasy = score;
            localStorage.setItem("highestScoreEasy", highestEasy);
        } else if (level.value === "Medium" && score > highestMedium) {
            highestMedium = score;
            localStorage.setItem("highestScoreMedium", highestMedium);
        } else if (level.value === "Hard" && score > highestHard) {
            highestHard = score;
            localStorage.setItem("highestScoreHard", highestHard);
        }
        updateHighestScoresDisplay();
    };

    // Reset the game
    const resetGame = () => {
        updateHighestScore();
        currentQuestionIndex = 0;
        score = 0;
        timer = 30 * 60;
        scoreElement.textContent = score;
        remainingTime.textContent = formatTime(timer);
        gameArea.style.display = "none";
        startArea.style.display = "block";
        clearInterval(interval);
    };

    // Format time for display
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    // Start the timer
    const startTimer = () => {
        if (timedQuiz.checked) {
            interval = setInterval(() => {
                timer--;
                remainingTime.textContent = formatTime(timer);
                if (timer <= 0) {
                    clearInterval(interval);
                    alert("Time's up! Your Score: " + Math.round(score));
                    updateHighestScore();
                    resetGame();
                }
            }, 1000);
        } else {
            // If timer is disabled, show "--:--"
            remainingTime.textContent = "--:--";
        }
    };

    // Filter and limit data based on level
    const filterAndLimitData = (data, continent, level) => {
        // Get the data for the specified continent, or all continents if "All" is selected
        let filteredData = continent === "All" ? Object.values(data).flat() : data[continent] || [];

        // Shuffle the filtered data
        filteredData = shuffleArray(filteredData);

        // Filter data based on the level and add fallback logic
        let result = [];
        if (level === "Easy") {
            result = filteredData.filter(item => item.preference === 1);
            if (result.length < 30) {
                const additionalData = filteredData.filter(item => item.preference !== 1).slice(0, 30 - result.length);
                result = result.concat(additionalData);
            }
        } else if (level === "Medium") {
            result = filteredData.filter(item => item.preference === 2);
            if (result.length < 70) {
                const additionalData = filteredData.filter(item => item.preference !== 2).slice(0, 70 - result.length);
                result = result.concat(additionalData);
            }
        }

        return result;
    };


    // Start the game
    playNowBtn.addEventListener("click", () => {
        currentData = filterAndLimitData(data, continent.value, level.value);
        startArea.style.display = "none";
        gameArea.style.display = "block";
        renderQuestion();
        if (timedQuiz.checked) {
            startTimer();
        }
    });

    // Next button functionality
    nextBtn.addEventListener("click", () => {
        currentQuestionIndex++;
        renderQuestion();
    });

    // Submit button functionality
    submitBtn.addEventListener("click", () => {
        clearInterval(interval);
        questionNo = 0;
        alert("Quiz Submitted! Your Score: " + Math.round(score));
        updateHighestScore();
        resetGame();
    });

    // Initialize highest scores display
    updateHighestScoresDisplay();
});