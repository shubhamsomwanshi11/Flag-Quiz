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
    const flagImage = document.getElementById("flagImage");

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
            options.add(randomCountry.name);
        }
        return shuffleArray([...options]);
    };

    const renderQuestion = () => {
        questionNo++;
        if (currentQuestionIndex >= currentData.length) {
            alert("Quiz Completed! Your Score: " + score);
            resetGame();
            return;
        }
        questionNumber.innerHTML = `<span class="has-text-success">${questionNo}</span> of <span class="has-text-warning">${currentData.length}</span>`;


        // Randomly select a country for the flag
        const randomIndex = Math.floor(Math.random() * currentData.length);
        const currentCountry = currentData[randomIndex];

        const allCountries = Object.values(data).flat();
        const options = generateOptions(currentCountry.name, allCountries);

        // Update flag image
        flagImage.src = `../assets/Flag Images/${currentCountry.img}`;
        flagImage.alt = `${currentCountry.name} Flag`;

        // Shuffle options again to randomize their order
        optionsContainer.innerHTML = "";
        shuffleArray(options).forEach((option) => {
            const btn = document.createElement("button");
            btn.className = "button is-large is-outlined is-fullwidth option-btn";
            btn.textContent = option;
            btn.disabled = false;
            btn.addEventListener("click", () => checkAnswer(option, currentCountry.name, btn));
            const column = document.createElement("div");
            column.classList.add("column", "is-6");
            column.appendChild(btn);
            optionsContainer.appendChild(column);
        });

        nextBtn.style.display = "none";
    };

    // Check the answer
    const checkAnswer = (selectedOption, correctAnswer, button) => {
        // Disable all buttons after selection
        optionsContainer.querySelectorAll("button").forEach((btn) => (btn.disabled = true));

        if (selectedOption === correctAnswer) {
            button.classList.add("is-success");
            const scoreIncrement = 100 / currentData.length;
            score += scoreIncrement;
            scoreElement.textContent = Math.round(score);
        } else {
            button.classList.add("is-danger");
            optionsContainer.querySelectorAll("button").forEach((btn) => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add("is-success");
                }
            });
        }

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
        questionNo = 0;
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