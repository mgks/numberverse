import { initializeState, toggleTheme, toggleMode } from './modules/stateManager.js';
import { updateConverterOutputs } from './modules/numberLogic.js';

// --- MODAL MANAGER MODULE ---
// This section handles the generic functionality of opening and closing the modal.
const modalOverlay = document.getElementById('modal-overlay');
const modalTitleElem = document.getElementById('modal-title');
const modalContentElem = document.getElementById('modal-content');
const modalCloseBtn = document.getElementById('modal-close-btn');

function openModal(title, contentHTML) {
    if (!modalOverlay) return;
    modalTitleElem.textContent = title;
    modalContentElem.innerHTML = contentHTML;
    modalOverlay.classList.add('active');
}

function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
}
// --- END MODAL MANAGER ---


// This event ensures our script runs after the entire HTML page is loaded.
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. INITIALIZE SETTINGS (THEME & MODE) ---
    initializeState();
    
    // --- 2. HEADER CONTROLS ---
    const themeToggleButton = document.getElementById('themeToggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    const modeToggleButton = document.getElementById('modeToggle');
    if (modeToggleButton) {
        modeToggleButton.addEventListener('click', toggleMode);
    }

    // --- 3. DROPDOWN NAVIGATION ---
    const menuToggles = document.querySelectorAll('[data-menu-toggle]');
    const subNavContainer = document.getElementById('sub-nav-container');
    const subMenus = document.querySelectorAll('[data-menu]');

    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const menuId = toggle.dataset.menuToggle;
            const targetMenu = document.getElementById(`${menuId}-menu`);

            if (toggle.classList.contains('menu-active')) {
                subNavContainer.classList.remove('active');
                toggle.classList.remove('menu-active');
                if (targetMenu) targetMenu.classList.remove('active');
                return;
            }

            menuToggles.forEach(t => t.classList.remove('menu-active'));
            subMenus.forEach(m => m.classList.remove('active'));

            subNavContainer.classList.add('active');
            toggle.classList.add('menu-active');
            if (targetMenu) targetMenu.classList.add('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('header') && !e.target.closest('.sub-nav-container')) {
            subNavContainer.classList.remove('active');
            menuToggles.forEach(t => t.classList.remove('menu-active'));
            subMenus.forEach(m => m.classList.remove('active'));
        }
    });

    // --- 4. HAMBURGER MENU (MOBILE) ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
        });
    }

    // --- 5. MODAL EVENT LISTENERS ---
    if (modalOverlay && modalCloseBtn) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    // --- 6. PAGE-SPECIFIC LOGIC ---

    // A. Number System Bridge Logic
    const numberInput = document.getElementById('numberInput');
    if (numberInput) {
        numberInput.addEventListener('input', (e) => {
            updateConverterOutputs(e.target.value);
        });
        updateConverterOutputs(''); // Initial call to clear placeholders
    }
    
    // B. Reusable Instructions Modal Logic
    const instructionsLink = document.getElementById('instructions-link');
    const instructionsContent = document.getElementById('instructions-content-template');
    
    if (instructionsLink && instructionsContent) {
        instructionsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const title = instructionsContent.dataset.modalTitle || 'Instructions';
            const contentHTML = instructionsContent.innerHTML;
            openModal(title, contentHTML);
        });
    }

    console.log('NumberVerse App Initialized!');
});