const docHtml = document.documentElement; // Target <html> for theme
const docBody = document.body; // Target <body> for mode

const getInitialPreference = (key, defaultValue) => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? storedValue : defaultValue;
};

// --- Theme Management ---
let currentTheme = getInitialPreference('theme', 'light');

export const applyTheme = (theme) => {
    currentTheme = theme;
    docHtml.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};

export const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
};

// --- Mode Management (Kids/Adult) ---
// Standardized on 'kids' (singular) to match our data structures.
let currentMode = getInitialPreference('mode', 'kids');

export const applyMode = (mode) => {
    currentMode = mode;
    docBody.setAttribute('data-mode', mode);
    localStorage.setItem('mode', mode);

    // Update the button text to reflect the current mode
    const modeToggleButton = document.getElementById('modeToggle');
    if (modeToggleButton) {
        modeToggleButton.textContent = `${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`;
    }
    
    // BROADCAST THE CHANGE: Fire a custom event that other modules can listen for.
    const event = new CustomEvent('modechange', {
        detail: { newMode: mode }
    });
    docBody.dispatchEvent(event);
};

export const toggleMode = async () => {
    const newMode = currentMode === 'kids' ? 'adult' : 'kids';
    
    // CHECK if a game is currently active
    if (document.body.dataset.gameState === 'active') {
        try {
            // Await the user's choice from the confirmation modal
            await window.openConfirmationModal(
                'Switch Mode?',
                '<p>A challenge is currently in progress. Switching modes will restart the challenge.</p>',
                { confirmText: 'Restart in New Mode', cancelText: 'Continue Game' }
            );

            // Dispatch an event to tell the active challenge to abort itself
            document.body.dispatchEvent(new CustomEvent('forceAbortChallenge'));
            applyMode(newMode); // Now, switch the mode

        } catch (error) {
            // --- User clicked "Continue" or closed the modal ---
            console.log('Mode switch cancelled.');
            // Do nothing, the game continues.
        }
    } else {
        // --- No game is active, switch immediately ---
        applyMode(newMode);
    }
};

// --- Initializer ---
// This function runs once when the app loads
export const initializeState = () => {
    applyTheme(currentTheme);
    applyMode(currentMode); // This will now fire the initial 'modechange' event on load
};