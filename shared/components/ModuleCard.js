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
    const card = document.createElement('article');
    card.className = `module-card`;
    card.setAttribute('data-module', moduleData.number);
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-labelledby', `module-${moduleData.number}-title`);
    card.setAttribute('aria-describedby', `module-${moduleData.number}-desc`);
    card.setAttribute('tabindex', '0');

    // Module number label
    const moduleNumber = document.createElement('div');
    moduleNumber.className = 'module-number';
    moduleNumber.textContent = `Module ${moduleData.number}`;
    moduleNumber.setAttribute('aria-label', `Module number ${moduleData.number}`);

    // Module title
    const title = document.createElement('h3');
    title.id = `module-${moduleData.number}-title`;
    title.textContent = moduleData.title;

    // Module description
    const description = document.createElement('p');
    description.id = `module-${moduleData.number}-desc`;
    description.textContent = moduleData.description;

    // Module stats
    const stats = document.createElement('div');
    stats.className = 'module-stats';
    stats.setAttribute('aria-label', `Module content: ${moduleData.lessonCount} lessons, ${moduleData.demoCount} demonstrations, ${moduleData.practiceCount} practice ${moduleData.practiceCount === 1 ? 'set' : 'sets'}`);
    stats.innerHTML = `
      <span aria-hidden="true">${moduleData.lessonCount} Lessons</span>
      <span aria-hidden="true">${moduleData.demoCount} Demonstrations</span>
      <span aria-hidden="true">${moduleData.practiceCount} Practice ${moduleData.practiceCount === 1 ? 'Set' : 'Sets'}</span>
    `;

    // View button
    const button = document.createElement('a');
    button.href = moduleData.path;
    button.className = 'btn btn-primary';
    button.textContent = 'View Module';
    button.setAttribute('aria-label', `View Module ${moduleData.number}: ${moduleData.title}`);

    // Keyboard navigation
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });

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
