document.addEventListener("DOMContentLoaded", async () => {
    // DOM Elements
    const highestScoreEasy = document.getElementById('highestScoreEasy');
    const highestScoreMedium = document.getElementById('highestScoreMedium');
    const highestScoreHard = document.getElementById('highestScoreHard');

    // Load Scores from Local Storage
    const highestEasy = parseInt(localStorage.getItem("highestScoreEasy") || 0);
    const highestMedium = parseInt(localStorage.getItem("highestScoreMedium") || 0);
    const highestHard = parseInt(localStorage.getItem("highestScoreHard") || 0);

    highestScoreEasy.innerHTML = highestEasy;
    highestScoreMedium.innerHTML = highestMedium;
    highestScoreHard.innerHTML = highestHard;
});