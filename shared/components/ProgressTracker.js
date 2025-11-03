/**
 * ProgressTracker Component
 * Tracks and displays student progress through modules
 */

export class ProgressTracker {
  /**
   * Create a new progress tracker
   * @param {number} moduleNumber - Module number (1-6)
   * @param {Object} moduleData - Module configuration data
   */
  constructor(moduleNumber, moduleData) {
    this.moduleNumber = moduleNumber;
    this.moduleData = moduleData;
    this.storageKey = `cpsc3600-module${moduleNumber}-progress`;
    this.progress = this.loadProgress();
  }

  /**
   * Load progress from localStorage
   * @returns {Object} Progress data
   */
  loadProgress() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {
        lessonsCompleted: [],
        demosCompleted: [],
        practiceCompleted: [],
        lastAccessed: null
      };
    } catch (error) {
      console.error('ProgressTracker: Error loading progress', error);
      return {
        lessonsCompleted: [],
        demosCompleted: [],
        practiceCompleted: [],
        lastAccessed: null
      };
    }
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    try {
      this.progress.lastAccessed = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    } catch (error) {
      console.error('ProgressTracker: Error saving progress', error);
    }
  }

  /**
   * Mark an activity as complete
   * @param {string} type - Activity type ('lessons', 'demos', 'practice')
   * @param {string} id - Activity ID
   */
  markComplete(type, id) {
    const key = `${type}Completed`;
    if (!this.progress[key]) {
      this.progress[key] = [];
    }

    if (!this.progress[key].includes(id)) {
      this.progress[key].push(id);
      this.saveProgress();
      this.dispatchEvent('progress-updated');
    }
  }

  /**
   * Mark an activity as incomplete
   * @param {string} type - Activity type ('lessons', 'demos', 'practice')
   * @param {string} id - Activity ID
   */
  markIncomplete(type, id) {
    const key = `${type}Completed`;
    if (this.progress[key]) {
      const index = this.progress[key].indexOf(id);
      if (index > -1) {
        this.progress[key].splice(index, 1);
        this.saveProgress();
        this.dispatchEvent('progress-updated');
      }
    }
  }

  /**
   * Check if an activity is complete
   * @param {string} type - Activity type ('lessons', 'demos', 'practice')
   * @param {string} id - Activity ID
   * @returns {boolean}
   */
  isComplete(type, id) {
    const key = `${type}Completed`;
    return this.progress[key] && this.progress[key].includes(id);
  }

  /**
   * Get completion percentage
   * @returns {number} Percentage (0-100)
   */
  getCompletionPercentage() {
    const total = this.getTotalActivities();
    const completed = this.getCompletedActivities();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  /**
   * Get total number of activities in module
   * @returns {number}
   */
  getTotalActivities() {
    if (!this.moduleData) return 0;
    return this.moduleData.lessonCount + this.moduleData.demoCount + this.moduleData.practiceCount;
  }

  /**
   * Get number of completed activities
   * @returns {number}
   */
  getCompletedActivities() {
    return (
      (this.progress.lessonsCompleted?.length || 0) +
      (this.progress.demosCompleted?.length || 0) +
      (this.progress.practiceCompleted?.length || 0)
    );
  }

  /**
   * Reset all progress
   */
  reset() {
    this.progress = {
      lessonsCompleted: [],
      demosCompleted: [],
      practiceCompleted: [],
      lastAccessed: null
    };
    this.saveProgress();
    this.dispatchEvent('progress-reset');
  }

  /**
   * Create visual progress bar element
   * @returns {HTMLElement}
   */
  render() {
    const container = document.createElement('div');
    container.className = 'progress-tracker';

    const percentage = this.getCompletionPercentage();
    const completed = this.getCompletedActivities();
    const total = this.getTotalActivities();

    container.innerHTML = `
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
      </div>
      <p class="progress-text">${completed}/${total} activities complete (${percentage}%)</p>
    `;

    return container;
  }

  /**
   * Update existing progress bar element
   * @param {HTMLElement} element - Progress tracker element to update
   */
  update(element) {
    const percentage = this.getCompletionPercentage();
    const completed = this.getCompletedActivities();
    const total = this.getTotalActivities();

    const fill = element.querySelector('.progress-bar-fill');
    const text = element.querySelector('.progress-text');

    if (fill) {
      fill.style.width = `${percentage}%`;
    }

    if (text) {
      text.textContent = `${completed}/${total} activities complete (${percentage}%)`;
    }
  }

  /**
   * Dispatch custom event
   * @param {string} eventName - Event name
   */
  dispatchEvent(eventName) {
    const event = new CustomEvent(eventName, {
      detail: {
        moduleNumber: this.moduleNumber,
        progress: this.progress,
        percentage: this.getCompletionPercentage()
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get progress for all modules
   * @static
   * @returns {Object} Progress for all modules
   */
  static getAllProgress() {
    const allProgress = {};
    for (let i = 1; i <= 6; i++) {
      const key = `cpsc3600-module${i}-progress`;
      try {
        const stored = localStorage.getItem(key);
        allProgress[i] = stored ? JSON.parse(stored) : null;
      } catch (error) {
        allProgress[i] = null;
      }
    }
    return allProgress;
  }

  /**
   * Calculate overall course progress
   * @static
   * @param {Array} modulesData - Array of module configuration objects
   * @returns {number} Overall percentage (0-100)
   */
  static getOverallProgress(modulesData) {
    let totalActivities = 0;
    let totalCompleted = 0;

    modulesData.forEach((module, index) => {
      const tracker = new ProgressTracker(index + 1, module);
      totalActivities += tracker.getTotalActivities();
      totalCompleted += tracker.getCompletedActivities();
    });

    return totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;
  }
}

export default ProgressTracker;
