document.addEventListener("DOMContentLoaded", async () => {
    const playNowBtn = document.getElementById("playNowBtn");
    const gameArea = document.getElementById("gameArea");
    const startArea = document.getElementById("startArea");
    const flagImage = document.getElementById("flagImage");
    const optionsContainer = document.getElementById("optionsContainer");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const scoreElement = document.getElementById("score");
    const remainingTime = document.getElementById("remainingTime");
    const continent = document.getElementById('continent');
    const timedQuiz = document.getElementById('timedQuiz');
    let highestScore = localStorage.getItem("flagScore") || 0;


    document.getElementById('highestScore').innerHTML = highestScore;
    let data = {};
    let currentData = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer = 30 * 60; // 30 minutes in seconds
    let interval;

    // Fetch country data
    try {
        data = await fetch('../data/countries.json').then((res) => res.json());
    } catch (error) {
        console.error("Error fetching country data:", error);
    }

    // Shuffle an array
    const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

    // Generate options randomly
    const generateOptions = (correctAnswer, allCountries) => {
        const options = new Set([correctAnswer]);
        while (options.size < 4) {
            const randomCountry = allCountries[Math.floor(Math.random() * allCountries.length)].name;
            options.add(randomCountry);
        }
        return shuffleArray([...options]);
    };

    // Render the current question
    const renderQuestion = () => {
        if (currentQuestionIndex >= currentData.length) {
            alert("Quiz Completed! Your Score: " + score);
            resetGame();
            return;
        }

        const currentCountry = currentData[currentQuestionIndex];
        const allCountries = Object.values(data).flat();
        const options = generateOptions(currentCountry.name, allCountries);

        // Update flag image
        flagImage.src = `../assets/Flag Images/${currentCountry.img}`;
        flagImage.alt = `${currentCountry.name} Flag`;

        // Update options
        optionsContainer.innerHTML = "";
        options.forEach((option) => {
            const btn = document.createElement("button");
            btn.className = "button is-large is-outlined is-fullwidth option-btn";
            btn.textContent = option;
            btn.disabled = false;
            btn.addEventListener("click", () => checkAnswer(option, currentCountry.name, btn));
            const column = document.createElement('div');
            column.classList.add('column', 'is-6');
            column.appendChild(btn);
            optionsContainer.appendChild(column);
        });

        // Hide the Next button until an answer is selected
        nextBtn.style.display = "none";
    };

    // Check the answer
    const checkAnswer = (selectedOption, correctAnswer, button) => {
        const buttons = optionsContainer.querySelectorAll(".option-btn");

        // Disable all options after selection
        buttons.forEach((btn) => (btn.disabled = true));

        if (selectedOption === correctAnswer) {
            button.classList.add("is-success");
            score += 1;
            if (score > highestScore) {
                highestScore = score;
                localStorage.setItem("flagScore", highestScore);
            }
            scoreElement.textContent = score;
        } else {
            button.classList.add("is-danger");
            // Highlight the correct option
            buttons.forEach((btn) => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add("is-success");
                }
            });
        }

        // Show the Next button
        nextBtn.style.display = "block";
    };

    // Reset the game
    const resetGame = () => {
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
                    alert("Time's up! Your Score: " + score);
                    resetGame();
                    document.getElementById('highestScore').innerHTML = highestScore;
                }
            }, 1000);
        } else {
            // If timer is disabled, show "--:--"
            remainingTime.textContent = "--:--";
        }
    };

    // Start the game
    playNowBtn.addEventListener("click", () => {
        currentData = getDataByContinent(data, continent.value);
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
        alert("Quiz Submitted! Your Score: " + score);
        resetGame();
        document.getElementById('highestScore').innerHTML = highestScore;
    });
});

function getDataByContinent(data, continent) {
    if (continent === "All") {
        return Object.values(data).flat();
    }
    return data[continent] || [];
}