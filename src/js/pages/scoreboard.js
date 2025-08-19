import { getProgress } from '../modules/progressManager.js';

function renderScores(mode) {
    // Defensive check to ensure a valid mode is passed.
    if (!mode) {
        console.error('Render function called without a mode.');
        return;
    }

    const progress = getProgress();
    const data = progress[mode];

    // Defensive check to ensure data exists for the mode.
    if (!data) {
        console.error(`No progress data found for mode: ${mode}`);
        // You could optionally clear the UI here or show an error message.
        document.getElementById('skill-level').textContent = 'Error';
        document.getElementById('daily-streak').textContent = '0';
        document.getElementById('nsb-scores-list').innerHTML = '<p>Could not load stats for this mode.</p>';
        return;
    }

    document.getElementById('skill-level').textContent = data.stats.skillLevel;
    document.getElementById('daily-streak').textContent = data.stats.dailyStreak;

    const nsbScoresList = document.getElementById('nsb-scores-list');
    const nsbScores = data.scores['number-system-bridge'] || [];

    if (nsbScores.length === 0) {
        nsbScoresList.innerHTML = '<p>No scores recorded yet for this mode.</p>';
        return;
    }

    nsbScoresList.innerHTML = nsbScores.map(s => `
        <div class="score-item">
            <span><strong>Score:</strong> ${s.score} | <strong>Accuracy:</strong> ${(s.correct / s.total * 100).toFixed(0)}%</span>
            <span style="color: #6c757d;">${new Date(s.timestamp).toLocaleDateString()}</span>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the initial mode from the body's data attribute and render the scoreboard.
    const initialMode = document.body.dataset.mode;
    renderScores(initialMode);

    // 2. Listen for the global 'modechange' event (fired by stateManager.js)
    //    and re-render the scoreboard whenever the mode is toggled in the header.
    document.body.addEventListener('modechange', (event) => {
        const newMode = event.detail.newMode;
        renderScores(newMode);
    });
});