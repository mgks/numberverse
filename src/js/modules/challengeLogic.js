/**
 * Generic Challenge Engine for NumberVerse quizzes.
 */
export class Challenge {
    constructor({ questionGenerator, totalQuestions = 10, duration = 90 }) {
        this.questionGenerator = questionGenerator;
        this.totalQuestions = totalQuestions;
        this.duration = duration;
        this.listeners = {};
        this.reset();
    }

    reset() {
        this.state = 'idle';
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.questions = [];
        this.timeLeft = 0;
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    // Simple event emitter: on(eventName, callback)
    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    }

    // Simple event emitter: emit(eventName, data)
    emit(eventName, data) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => callback(data));
        }
    }

    start() {
        this.reset();
        this.state = 'running';
        document.body.setAttribute('data-game-state', 'active');
        this.timeLeft = this.duration;

        for (let i = 0; i < this.totalQuestions; i++) {
            this.questions.push(this.questionGenerator());
        }

        // Start the countdown timer
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.emit('tick', { timeLeft: this.timeLeft });
            if (this.timeLeft <= 0) {
                this.finish();
            }
        }, 1000);

        this.startTimer();
        this.emit('start');
        this.emit('tick', { timeLeft: this.timeLeft });
        this.nextQuestion();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.emit('tick', { timeLeft: this.timeLeft });
            if (this.timeLeft <= 0) {
                this.finish();
            }
        }, 1000);
    }

    pauseTimer() {
        clearInterval(this.timerInterval);
    }

    nextQuestion() {
        if (this.currentQuestionIndex >= this.totalQuestions) {
            this.finish();
            return;
        }
        const questionData = this.questions[this.currentQuestionIndex];
        this.emit('nextquestion', {
            question: questionData,
            questionNumber: this.currentQuestionIndex + 1,
            totalQuestions: this.totalQuestions
        });
        this.startTimer();
    }

    submitAnswer(userAnswer) {
        if (this.state !== 'running') return;

        this.pauseTimer();

        const currentQuestion = this.questions[this.currentQuestionIndex];
        let isCorrect = false;

        if (currentQuestion.validation === 'strict') {
            // For questions where format matters, compare the strings directly after trimming whitespace.
            isCorrect = userAnswer.trim() === currentQuestion.answer.trim();
        } else {
            // For all other questions, normalize both answers by removing commas, spaces, and making them lowercase.
            const normalizedUserAnswer = String(userAnswer).replace(/[, ]/g, '').toLowerCase();
            const normalizedCorrectAnswer = String(currentQuestion.answer).replace(/[, ]/g, '').toLowerCase();
            isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        }

        if (isCorrect) {
            this.score += 100;
            this.correctAnswers++;
        }

        this.emit('answerresult', { isCorrect, correctAnswer: currentQuestion.answer });
        this.currentQuestionIndex++;
        
        setTimeout(() => this.nextQuestion(), isCorrect ? 800 : 1500);
    }

    finish() {
        if (this.state === 'finished') return;
        this.state = 'finished';
        document.body.removeAttribute('data-game-state');

        this.pauseTimer();

        // Stop the timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Final result is calculated. Unanswered questions are implicitly incorrect.
        const result = {
            score: this.score,
            correct: this.correctAnswers,
            total: this.totalQuestions,
            timestamp: Date.now()
        };
        this.emit('finish', result);
    }

    abort() {
        if (this.state !== 'running') return;
        this.state = 'finished'; // Mark as finished to stop interactions
        document.body.removeAttribute('data-game-state'); // CLEAR GLOBAL STATE
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.emit('abort'); // Fire an abort event for the UI to handle
        console.log('Challenge aborted by user.');
    }
}