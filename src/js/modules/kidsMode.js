const shapeContainer = document.querySelector('.kids-bg');
const symbols = ['#svg-num-7', '#svg-num-3', '#svg-num-9'];
let isInitialized = false;

/**
 * Generates a set of random, floating SVG shapes for the background.
 * This function only runs once to avoid creating duplicate shapes.
 */
function generateBackgroundShapes() {
    if (isInitialized || !shapeContainer) return;
    
    // Clear any previous shapes, just in case
    shapeContainer.innerHTML = ''; 

    const shapeCount = 15; // How many numbers to draw

    for (let i = 0; i < shapeCount; i++) {
        const shapeWrapper = document.createElement('div');
        shapeWrapper.className = 'bg-shape';

        // Choose a random symbol from our list
        const symbolId = symbols[i % symbols.length];
        
        // Use the <use> element to instance a symbol from our <defs>
        shapeWrapper.innerHTML = `<svg viewBox="0 0 100 120"><use xlink:href="${symbolId}" /></svg>`;
        
        // --- Apply Random Properties ---
        const size = 5 + Math.random() * 10; // Size in vw (5% to 15% of viewport width)
        shapeWrapper.style.width = `${size}vw`;
        shapeWrapper.style.height = 'auto';
        
        shapeWrapper.style.top = `${Math.random() * 90}%`;
        shapeWrapper.style.left = `${Math.random() * 90}%`;
        
        // Set custom properties for the animation
        shapeWrapper.style.setProperty('--r-start', `${Math.random() * 360}deg`);
        shapeWrapper.style.setProperty('--r-end', `${Math.random() * 360}deg`);
        
        // Randomize animation duration and starting point
        shapeWrapper.style.animationDuration = `${15 + Math.random() * 10}s`;
        shapeWrapper.style.animationDelay = `-${Math.random() * 25}s`;

        shapeContainer.appendChild(shapeWrapper);
    }
    
    isInitialized = true;
    console.log('Kids mode background initialized.');
}

/**
 * Sets up the logic for kids mode enhancements.
 * It listens for the modechange event to trigger the background generation.
 */
export function initKidsMode() {
    // Check initial mode on page load
    if (document.body.dataset.mode === 'kids') {
        generateBackgroundShapes();
    }
    
    // Listen for subsequent mode changes
    document.body.addEventListener('modechange', (event) => {
        if (event.detail.newMode === 'kids') {
            generateBackgroundShapes();
        }
    });
}