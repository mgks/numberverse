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

// --- Mode Management (Kid/Adult) ---
let currentMode = getInitialPreference('mode', 'kid');

export const applyMode = (mode) => {
    currentMode = mode;
    docBody.setAttribute('data-mode', mode);
    localStorage.setItem('mode', mode);

    // Update the button text to reflect the current mode
    const modeToggleButton = document.getElementById('modeToggle');
    if (modeToggleButton) {
        modeToggleButton.textContent = `${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`;
    }
};

export const toggleMode = () => {
    const newMode = currentMode === 'kid' ? 'adult' : 'kid';
    applyMode(newMode);
};

// --- Initializer ---
// This function runs once when the app loads
export const initializeState = () => {
    applyTheme(currentTheme);
    applyMode(currentMode);
};