/**
 * Home Page JavaScript
 * Handles dynamic module card generation and interactions
 */

import { ModuleCard } from './shared/components/ModuleCard.js';
import { MODULES } from './shared/constants/modules.js';

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeModuleCards();
});

/**
 * Initialize and render module cards
 */
function initializeModuleCards() {
  const container = document.getElementById('modules-container');

  if (!container) {
    console.error('Module container not found');
    return;
  }

  // Render all module cards
  ModuleCard.renderAll(container);

  // Optional: Add progress tracking if you want to show student progress
  // This would require implementing localStorage-based progress tracking
  // addProgressToCards();
}

/**
 * Add progress information to module cards (optional feature)
 * Uncomment this if you want to track and display student progress
 */
/*
function addProgressToCards() {
  const cards = document.querySelectorAll('.module-card');

  cards.forEach(card => {
    const moduleNumber = parseInt(card.dataset.module);
    const storageKey = `cpsc3600-module${moduleNumber}-progress`;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const progress = JSON.parse(stored);
        ModuleCard.addProgress(card, progress);
      }
    } catch (error) {
      console.error('Error loading progress for module', moduleNumber, error);
    }
  });
}
*/

// Log modules for debugging
console.log('CPSC 3600 - Computer Networks');
console.log(`Loaded ${MODULES.length} modules`);
