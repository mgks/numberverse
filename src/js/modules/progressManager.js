const PROGRESS_KEY = 'numberVerseProgress';

// Skill Level Definitions
const skillLevelTiers = {
  kids: [
    { threshold: 0, name: 'Number Newcomer' },
    { threshold: 400, name: 'Digit Explorer' },
    { threshold: 600, name: 'Calculation Cadet' },
    { threshold: 800, name: 'Math Whiz' },
    { threshold: 950, name: 'Number Master' }
  ],
  adult: [
    { threshold: 0, name: 'Analyst' },
    { threshold: 500, name: 'Senior Analyst' },
    { threshold: 750, name: 'Quant Pro' },
    { threshold: 900, name: 'Calculation Virtuoso' },
    { threshold: 980, name: 'NumberVerse Master' }
  ]
};

const baseDurations = { kids: 240, adult: 180 };
const levelReduction = 15;

export function getChallengeDuration(mode, skillLevel) {
    const tiers = skillLevelTiers[mode];
    const baseTime = baseDurations[mode];
    
    const tierIndex = tiers.findIndex(tier => tier.name === skillLevel);
    
    // If skill level is found, reduce time. Otherwise, use base time.
    const reduction = (tierIndex > 0) ? tierIndex * levelReduction : 0;
    
    // Ensure the timer doesn't go below a minimum threshold (e.g., 60 seconds)
    return Math.max(60, baseTime - reduction);
}

// Skill Level Calculation Function
function calculateSkillLevel(mode, allScores) {
    // We'll calculate based on the average score of the last 10 games.
    const recentScores = allScores.slice(0, 10);
    if (recentScores.length === 0) {
        return skillLevelTiers[mode][0].name; // Return default if no scores
    }
    
    const totalScore = recentScores.reduce((sum, s) => sum + s.score, 0);
    const averageScore = totalScore / recentScores.length;
    
    // Find the highest tier the user qualifies for
    let currentLevel = skillLevelTiers[mode][0].name;
    for (const tier of skillLevelTiers[mode]) {
        if (averageScore >= tier.threshold) {
            currentLevel = tier.name;
        }
    }
    return currentLevel;
}

// Default data structure for a new user.
const getDefaultProgress = () => ({
  kids: {
    stats: { skillLevel: skillLevelTiers.kids[0].name, dailyStreak: 0, lastPlayed: null },
    scores: { 'number-system-bridge': [] }
  },
  adult: {
    stats: { skillLevel: skillLevelTiers.adult[0].name, dailyStreak: 0, lastPlayed: null },
    scores: { 'number-system-bridge': [] }
  }
});

/**
 * Retrieves the user's progress from localStorage.
 * @returns {object} The parsed progress object.
 */
export function getProgress() {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : getDefaultProgress();
  } catch (error) {
    console.error('Error reading progress from localStorage:', error);
    return getDefaultProgress();
  }
}

/**
 * Saves the user's progress to localStorage.
 * @param {object} progressData The progress object to save.
 */
function saveProgress(progressData) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
  }
}

/**
 * Records the result of a completed challenge.
 * @param {string} mode - 'kids' or 'adult'.
 * @param {string} challengeName - e.g., 'number-system-bridge'.
 * @param {object} result - { score, correct, total, timestamp }.
 */
export function recordChallengeResult(mode, challengeName, result) {
    const progress = getProgress();
    
    // Defensive Check: If the mode doesn't exist, exit gracefully.
    if (!progress[mode]) {
        console.error(`Error recording result: Mode "${mode}" not found in progress object.`);
        return; 
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Add the new score, keeping only the last 20 scores per challenge
    const scores = progress[mode].scores[challengeName] || [];
    scores.unshift(result);
    progress[mode].scores[challengeName] = scores.slice(0, 20);

    // Update daily streak
    const lastPlayed = progress[mode].stats.lastPlayed;
    if (lastPlayed !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastPlayed === yesterday.toISOString().split('T')[0]) {
            progress[mode].stats.dailyStreak++; // Continue streak
        } else {
            progress[mode].stats.dailyStreak = 1; // Start a new streak
        }
    }
    progress[mode].stats.lastPlayed = today;
    
    // Update skill level after saving the new score
    const allChallengeScores = Object.values(progress[mode].scores).flat();
    progress[mode].stats.skillLevel = calculateSkillLevel(mode, allChallengeScores);

    saveProgress(progress);
}