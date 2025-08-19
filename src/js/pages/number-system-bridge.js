import { updateConverterOutputs, numberToWordsUS } from '../modules/numberLogic.js';
import { Challenge } from '../modules/challengeLogic.js';
import { recordChallengeResult, getProgress, getChallengeDuration } from '../modules/progressManager.js';
import { formatUS, formatIndian } from '../modules/numberFormatters.js';

// --- HELPER FUNCTIONS ---

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- REFINED SHORTHAND LOGIC ---
function numberToUsShorthand(num) {
    if (num >= 1e12) return { value: (num / 1e12), unit: 'T' };
    if (num >= 1e9)  return { value: (num / 1e9),  unit: 'B' };
    if (num >= 1e6)  return { value: (num / 1e6),  unit: 'M' };
    if (num >= 1e3)  return { value: (num / 1e3),  unit: 'K' };
    return { value: num, unit: '' };
}

function numberToIndianShorthand(num) {
    if (num >= 1e7) return { value: (num / 1e7), unit: 'Cr' };
    if (num >= 1e5) return { value: (num / 1e5), unit: 'L' };
    return { value: num, unit: '' };
}

// --- DEFINITIVE QUESTION TYPES ---
const kidsQuestionTypes = [1, 2, 9];
const adultQuestionTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function generateNsBridgeQuestion(type) {
    const isKidsMode = document.body.dataset.mode === 'kids';
    let questionText, correctAnswer;
    let validation = 'default';

    switch (type) {
        case 1: // US Format -> Indian Format
            const num1 = getRandomInt(100000, 99999999);
            questionText = `How is the number <strong>${formatUS(num1)}</strong> written in the <strong>Indian system</strong>?`;
            correctAnswer = formatIndian(num1);
            validation = 'strict';
            break;
        case 2: // Indian Format -> US Format
            const num2 = getRandomInt(100000, 99999999);
            questionText = `How is the number <strong>${formatIndian(num2)}</strong> written in the <strong>US system</strong>?`;
            correctAnswer = formatUS(num2);
            validation = 'strict';
            break;
        case 3: // US Words -> Number
            const usVal3 = getRandomInt(2, 999);
            const usMultiplier3 = [1e3, 1e6, 1e9][getRandomInt(0, 2)];
            const usWord3 = usMultiplier3 === 1e9 ? 'Billion' : (usMultiplier3 === 1e6 ? 'Million' : 'Thousand');
            const usTotal3 = usVal3 * usMultiplier3;
            questionText = `What is "<strong>${usVal3} ${usWord3}</strong>" as a number?`;
            correctAnswer = String(usTotal3);
            break;
        case 4: // Indian Words -> Number
            const indianVal4 = getRandomInt(2, 99);
            const indianMultiplier4 = [1e5, 1e7][getRandomInt(0, 1)];
            const indianWord4 = indianMultiplier4 === 1e7 ? 'Crore' : 'Lakh';
            const indianTotal4 = indianVal4 * indianMultiplier4;
            questionText = `What is "<strong>${indianVal4} ${indianWord4}</strong>" as a number?`;
            correctAnswer = String(indianTotal4);
            break;
        case 5: // Long US Number -> US Shorthand
            const numForUs5 = getRandomInt(500, 50000) * 1000;
            const usShorthand5 = numberToUsShorthand(numForUs5);
            const usShorthandVal5 = parseFloat(usShorthand5.value.toFixed(2));
            questionText = `Convert the number <strong>${formatUS(numForUs5)}</strong> to its <strong>US format shorthand</strong> (e.g., 1.5M).`;
            correctAnswer = `${usShorthandVal5}${usShorthand5.unit}`;
            break;
        case 6: // Long Indian Number -> Indian Shorthand
            const numForIndian6 = getRandomInt(5, 5000) * 100000;
            const indianShorthand6 = numberToIndianShorthand(numForIndian6);
            const indianShorthandVal6 = parseFloat(indianShorthand6.value.toFixed(2));
            questionText = `Convert the number <strong>${formatIndian(numForIndian6)}</strong> to its <strong>Indian format shorthand</strong> (e.g., 25L).`;
            correctAnswer = `${indianShorthandVal6}${indianShorthand6.unit}`;
            break;

        // --- FOOLPROOF SHORTHAND-TO-SHORTHAND LOGIC (THE FIX) ---
        case 7: // US Shorthand -> Indian Shorthand
            // 1. Generate a clean source value first.
            const sourceUsVal7 = getRandomInt(1, 400) * 0.5; // e.g., 0.5, 1, 1.5, ... 200
            const sourceUsUnit7 = ['M', 'B'][getRandomInt(0, 1)];
            const sourceUsText7 = `${sourceUsVal7}${sourceUsUnit7}`;
            
            // 2. Calculate the EXACT base number from the clean source.
            const multiplier7 = sourceUsUnit7 === 'B' ? 1e9 : 1e6;
            const baseNum7 = sourceUsVal7 * multiplier7;

            // 3. Calculate the EXACT target shorthand from the clean base number.
            const targetIndian7 = numberToIndianShorthand(baseNum7);
            const targetIndianText7 = `${parseFloat(targetIndian7.value.toFixed(2))}${targetIndian7.unit}`;
            
            questionText = `Convert <strong>${sourceUsText7}</strong> (US Shorthand) to its equivalent in <strong>Indian Shorthand</strong>.`;
            correctAnswer = targetIndianText7;
            break;
        case 8: // Indian Shorthand -> US Shorthand
            // 1. Generate a clean source value first.
            const sourceIndianVal8 = getRandomInt(1, 5000) * 0.5; // e.g., 0.5, 1, ... 2500
            const sourceIndianUnit8 = ['L', 'Cr'][getRandomInt(0, 1)];
            const sourceIndianText8 = `${sourceIndianVal8}${sourceIndianUnit8}`;

            // 2. Calculate the EXACT base number.
            const multiplier8 = sourceIndianUnit8 === 'Cr' ? 1e7 : 1e5;
            const baseNum8 = sourceIndianVal8 * multiplier8;

            // 3. Calculate the EXACT target shorthand.
            const targetUs8 = numberToUsShorthand(baseNum8);
            const targetUsText8 = `${parseFloat(targetUs8.value.toFixed(2))}${targetUs8.unit}`;

            questionText = `Convert <strong>${sourceIndianText8}</strong> (Indian Shorthand) to its equivalent in <strong>US Shorthand</strong>.`;
            correctAnswer = targetUsText8;
            break;
        // --- END OF FOOLPROOF LOGIC ---

        case 9: // General Words -> Number
            const numToConvert9 = isKidsMode ? getRandomInt(1000, 999999) : getRandomInt(1000000, 999000000);
            const words9 = numberToWordsUS(String(numToConvert9));
            questionText = `Convert "<strong>${words9}</strong>" to a number.`;
            correctAnswer = String(numToConvert9);
            break;
        default: // Fallback
            const fallbackNum = getRandomInt(100000, 99999999);
            questionText = `How is <strong>${formatUS(fallbackNum)}</strong> written in the <strong>Indian system</strong>?`;
            correctAnswer = formatIndian(fallbackNum);
            validation = 'strict';
    }

    return { question: questionText, answer: correctAnswer, validation: validation };
}


// --- INITIALIZATION LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    // Practice page logic
    const practiceInput = document.getElementById('numberInput');
    if (practiceInput) {
        practiceInput.addEventListener('input', (e) => updateConverterOutputs(e.target.value));
        updateConverterOutputs('');
    }

    // Challenge page logic
    const challengeContainer = document.getElementById('challenge-container');
    if (challengeContainer) {
        const startScreen = document.getElementById('start-screen');
        const gameScreen = document.getElementById('game-screen');
        const endScreen = document.getElementById('end-screen');
        const startBtn = document.getElementById('start-challenge-btn');
        const questionTextElem = document.getElementById('question-text');
        const questionCounterElem = document.getElementById('question-counter');
        const answerInput = document.getElementById('challenge-answer');
        const submitBtn = document.getElementById('submit-answer-btn');
        const feedbackElem = document.getElementById('feedback');
        const finalScoreElem = document.getElementById('final-score');
        const finalAccuracyElem = document.getElementById('final-accuracy');
        const playAgainBtn = document.getElementById('play-again-btn');
        const timerElem = document.getElementById('timer');
        const startScreenText = document.querySelector('#start-screen p');

        playAgainBtn.addEventListener('click', () => {
            endScreen.style.display = 'none';
            startScreen.style.display = 'block';
        });
        
        startBtn.addEventListener('click', () => {
            const currentMode = document.body.dataset.mode;
            const progress = getProgress();
            const userSkillLevel = progress[currentMode].stats.skillLevel;
            const duration = getChallengeDuration(currentMode, userSkillLevel);

            if (startScreenText) {
                startScreenText.innerHTML = `You will be asked 10 questions with a <strong>${duration} second</strong> time limit.<br />Good luck!`;
            }

            let questionSequence = shuffleArray(currentMode === 'kids' ? [...kidsQuestionTypes] : [...adultQuestionTypes]);
            let questionIndex = 0;
            
            const challenge = new Challenge({
                questionGenerator: () => {
                    const type = questionSequence[questionIndex % questionSequence.length];
                    questionIndex++;
                    return generateNsBridgeQuestion(type);
                },
                totalQuestions: 10,
                duration: duration
            });

            challenge.on('start', () => {
                startScreen.style.display = 'none';
                endScreen.style.display = 'none';
                gameScreen.style.display = 'block';
                timerElem.classList.remove('danger');
            });

            challenge.on('tick', (data) => {
                const minutes = Math.floor(data.timeLeft / 60);
                const seconds = data.timeLeft % 60;
                timerElem.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                if (data.timeLeft <= 10) {
                    timerElem.classList.add('danger');
                } else {
                    timerElem.classList.remove('danger');
                }
            });

            challenge.on('nextquestion', (data) => {
                questionTextElem.innerHTML = data.question.question;
                questionCounterElem.textContent = `Question ${data.questionNumber} of ${data.totalQuestions}`;
                answerInput.value = '';
                answerInput.disabled = false;
                submitBtn.disabled = false;
                feedbackElem.textContent = '';
                feedbackElem.className = 'feedback';
                answerInput.focus();
            });

            challenge.on('answerresult', (data) => {
                if (data.isCorrect) {
                    feedbackElem.textContent = 'Correct!';
                    feedbackElem.className = 'feedback correct';
                } else {
                    feedbackElem.textContent = `Not quite. The answer was ${data.correctAnswer}`;
                    feedbackElem.className = 'feedback incorrect';
                }
            });

            challenge.on('finish', (result) => {
                gameScreen.style.display = 'none';
                endScreen.style.display = 'block';
                finalScoreElem.textContent = result.score;
                const accuracy = (result.correct / result.total) * 100;
                finalAccuracyElem.textContent = `${accuracy.toFixed(0)}%`;
                timerElem.textContent = "0:00";
                
                const modeAtFinish = document.body.dataset.mode;
                recordChallengeResult(modeAtFinish, 'number-system-bridge', result);
            });

            const handleSubmit = () => {
                if (answerInput.value.trim() === '') return;
                challenge.submitAnswer(answerInput.value);
                answerInput.disabled = true;
                submitBtn.disabled = true;
            };
            submitBtn.addEventListener('click', handleSubmit);
            answerInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleSubmit();
            });

            challenge.start();
        });
    }
});