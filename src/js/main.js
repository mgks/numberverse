import { initializeState, toggleTheme, toggleMode } from './modules/stateManager.js';
import { initKidsMode } from './modules/kidsMode.js';

// --- MODAL MANAGER MODULE ---
// This section handles the generic functionality of opening and closing the modal.
const modalOverlay = document.getElementById('modal-overlay');
const modalTitleElem = document.getElementById('modal-title');
const modalContentElem = document.getElementById('modal-content');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalActions = document.getElementById('modal-actions');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

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

/**
 * Opens a confirmation modal and returns a promise.
 * Resolves if the user confirms, rejects if they cancel.
 * @param {string} title
 * @param {string} contentHTML
 * @param {object} [options] - { confirmText: 'OK', cancelText: 'Cancel' }
 * @returns {Promise<void>}
 */
function openConfirmationModal(title, contentHTML, options = {}) {
    return new Promise((resolve, reject) => {
        if (!modalOverlay) return reject();

        modalTitleElem.textContent = title;
        modalContentElem.innerHTML = contentHTML;
        
        modalConfirmBtn.textContent = options.confirmText || 'Confirm';
        modalCancelBtn.textContent = options.cancelText || 'Cancel';
        modalActions.style.display = 'block';
        modalCloseBtn.style.display = 'none';

        modalOverlay.classList.add('active');

        const handleConfirm = () => {
            closeModal();
            cleanup();
            resolve();
        };

        const handleCancel = () => {
            closeModal();
            cleanup();
            reject();
        };

        const cleanup = () => {
            modalConfirmBtn.removeEventListener('click', handleConfirm);
            modalCancelBtn.removeEventListener('click', handleCancel);
            modalActions.style.display = 'none';
            modalCloseBtn.style.display = 'block';
        };

        modalConfirmBtn.addEventListener('click', handleConfirm);
        modalCancelBtn.addEventListener('click', handleCancel);
    });
}
// Make the confirmation modal globally accessible
window.openConfirmationModal = openConfirmationModal;

// --- END MODAL MANAGER ---


// This event ensures our script runs after the entire HTML page is loaded.
document.addEventListener('DOMContentLoaded', () => {
    
    // --- INITIALIZE GLOBAL SETTINGS ---
    initializeState();
    initKidsMode();
    
    // --- GLOBAL HEADER CONTROLS ---
    const themeToggleButton = document.getElementById('themeToggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    const modeToggleButton = document.getElementById('modeToggle');
    if (modeToggleButton) {
        modeToggleButton.addEventListener('click', toggleMode);
    }

    // --- GLOBAL DROPDOWN NAVIGATION ---
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

    // --- GLOBAL HAMBURGER MENU (MOBILE) ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
        });
    }

    // --- GLOBAL MODAL EVENT LISTENERS ---
    if (modalOverlay && modalCloseBtn) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    // --- GENERIC INSTRUCTIONS MODAL LOGIC (can live here as it's reusable) ---
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