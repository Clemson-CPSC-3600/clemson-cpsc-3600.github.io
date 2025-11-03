/**
 * ModuleCard Component
 * Creates module cards for the home page
 */

import { MODULES } from '../constants/modules.js';

export class ModuleCard {
  /**
   * Create a module card element
   * @param {Object} moduleData - Module configuration data
   * @returns {HTMLElement} Module card element
   */
  static create(moduleData) {
    const card = document.createElement('div');
    card.className = `module-card module-${moduleData.number}`;
    card.setAttribute('data-module', moduleData.number);

    // Module number badge
    const moduleNumber = document.createElement('div');
    moduleNumber.className = 'module-number';
    moduleNumber.textContent = `Module ${moduleData.number}`;

    // Module title
    const title = document.createElement('h3');
    title.textContent = moduleData.title;

    // Module description
    const description = document.createElement('p');
    description.textContent = moduleData.description;

    // Module stats
    const stats = document.createElement('div');
    stats.className = 'module-stats';
    stats.innerHTML = `
      <span>${moduleData.lessonCount} lessons</span>
      <span>${moduleData.demoCount} demos</span>
      <span>${moduleData.practiceCount} practice ${moduleData.practiceCount === 1 ? 'set' : 'sets'}</span>
    `;

    // Start button
    const button = document.createElement('a');
    button.href = moduleData.path;
    button.className = 'btn btn-primary';
    button.textContent = 'Start Module';

    // Assemble card
    card.appendChild(moduleNumber);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(stats);
    card.appendChild(button);

    return card;
  }

  /**
   * Create all module cards
   * @returns {HTMLElement[]} Array of module card elements
   */
  static createAll() {
    return MODULES.map(module => ModuleCard.create(module));
  }

  /**
   * Render module cards into a container
   * @param {string|HTMLElement} container - Container selector or element
   */
  static renderAll(container) {
    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      console.error('ModuleCard: Container not found');
      return;
    }

    const cards = ModuleCard.createAll();
    cards.forEach(card => containerEl.appendChild(card));
  }

  /**
   * Add progress information to a module card
   * @param {HTMLElement} card - Module card element
   * @param {Object} progress - Progress data {lessonsCompleted, demosCompleted, practiceCompleted}
   */
  static addProgress(card, progress) {
    const moduleNumber = parseInt(card.dataset.module);
    const module = MODULES.find(m => m.number === moduleNumber);

    if (!module) return;

    const totalActivities = module.lessonCount + module.demoCount + module.practiceCount;
    const completedActivities =
      (progress.lessonsCompleted || 0) +
      (progress.demosCompleted || 0) +
      (progress.practiceCompleted || 0);

    const percentage = Math.round((completedActivities / totalActivities) * 100);

    // Add progress indicator
    const progressEl = document.createElement('div');
    progressEl.className = 'progress-tracker';
    progressEl.innerHTML = `
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
      </div>
      <p class="progress-text">${percentage}% Complete</p>
    `;

    // Insert after stats, before button
    const button = card.querySelector('.btn');
    card.insertBefore(progressEl, button);
  }
}

export default ModuleCard;
