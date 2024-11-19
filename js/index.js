document.addEventListener("DOMContentLoaded", () => {
    const highestScoreEasy = document.getElementById('highestScoreEasy');
    const highestScoreMedium = document.getElementById('highestScoreMedium');
    const highestScoreHard = document.getElementById('highestScoreHard');

    let highestEasy = parseInt(localStorage.getItem("highestScoreEasy") || 0);
    let highestMedium = parseInt(localStorage.getItem("highestScoreMedium") || 0);
    let highestHard = parseInt(localStorage.getItem("highestScoreHard") || 0);

    highestScoreEasy.innerHTML = highestEasy; 
    highestScoreMedium.innerHTML = highestMedium; 
    highestScoreHard.innerHTML = highestHard; 
})