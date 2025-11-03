/**
 * ActivityList Component
 * Creates lists of activities (lessons, demos, practice) with progress indicators
 */

import { ProgressTracker } from './ProgressTracker.js';

export class ActivityList {
  /**
   * Create an activity list element
   * @param {Array} activities - Array of activity objects {id, title, estimatedTime, status}
   * @param {string} type - Activity type ('lessons', 'demos', 'practice')
   * @param {string} basePath - Base path for links
   * @param {ProgressTracker} [progressTracker] - Optional progress tracker
   * @returns {HTMLElement} Activity list element
   */
  static create(activities, type, basePath, progressTracker = null) {
    const list = document.createElement('ol');
    list.className = 'activity-list';
    list.setAttribute('data-type', type);

    activities.forEach((activity, index) => {
      const item = ActivityList.createItem(activity, type, basePath, progressTracker);
      list.appendChild(item);
    });

    return list;
  }

  /**
   * Create a single activity list item
   * @param {Object} activity - Activity object
   * @param {string} type - Activity type
   * @param {string} basePath - Base path for link
   * @param {ProgressTracker} [progressTracker] - Optional progress tracker
   * @returns {HTMLElement} List item element
   */
  static createItem(activity, type, basePath, progressTracker = null) {
    const item = document.createElement('li');
    item.setAttribute('data-activity-id', activity.id);

    // Create link
    const link = document.createElement('a');
    link.href = `${basePath}${type}/${activity.id}/`;
    link.textContent = activity.title;

    // Add time estimate
    const timeEstimate = document.createElement('span');
    timeEstimate.className = 'time-estimate';
    timeEstimate.textContent = activity.estimatedTime;

    // Add status badge if available
    if (activity.status) {
      const statusBadge = document.createElement('span');
      statusBadge.className = `activity-status ${activity.status}`;
      statusBadge.textContent = activity.status;
      item.appendChild(statusBadge);
    }

    // Add completion indicator if progress tracker is provided
    if (progressTracker && progressTracker.isComplete(type, activity.id)) {
      const checkmark = document.createElement('span');
      checkmark.className = 'completion-indicator';
      checkmark.innerHTML = '✓';
      checkmark.style.color = 'var(--color-success)';
      checkmark.style.marginLeft = 'var(--space-2)';
      checkmark.style.fontWeight = 'bold';
      item.appendChild(checkmark);
    }

    item.appendChild(link);
    item.appendChild(timeEstimate);

    return item;
  }

  /**
   * Create a section with title and activity list
   * @param {string} title - Section title (e.g., "📚 Lessons")
   * @param {Array} activities - Array of activities
   * @param {string} type - Activity type
   * @param {string} basePath - Base path for links
   * @param {ProgressTracker} [progressTracker] - Optional progress tracker
   * @returns {HTMLElement} Section element
   */
  static createSection(title, activities, type, basePath, progressTracker = null) {
    const section = document.createElement('section');
    section.className = 'content-section';

    const heading = document.createElement('h2');
    heading.textContent = title;
    section.appendChild(heading);

    if (activities && activities.length > 0) {
      const list = ActivityList.create(activities, type, basePath, progressTracker);
      section.appendChild(list);
    } else {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'Content coming soon...';
      emptyMessage.style.color = 'var(--color-text-light)';
      emptyMessage.style.fontStyle = 'italic';
      section.appendChild(emptyMessage);
    }

    return section;
  }

  /**
   * Create all activity sections for a module
   * @param {Object} moduleData - Module configuration object
   * @param {string} basePath - Base path for links (usually './')
   * @param {ProgressTracker} [progressTracker] - Optional progress tracker
   * @returns {HTMLElement} Container with all sections
   */
  static createModuleSections(moduleData, basePath = './', progressTracker = null) {
    const container = document.createElement('div');
    container.className = 'module-content';

    // Lessons section
    if (moduleData.lessons) {
      const lessonsSection = ActivityList.createSection(
        '📚 Lessons',
        moduleData.lessons,
        'lessons',
        basePath,
        progressTracker
      );
      container.appendChild(lessonsSection);
    }

    // Demos section
    if (moduleData.demos) {
      const demosSection = ActivityList.createSection(
        '🎮 Interactive Demos',
        moduleData.demos,
        'demos',
        basePath,
        progressTracker
      );
      container.appendChild(demosSection);
    }

    // Practice section
    if (moduleData.practice) {
      const practiceSection = ActivityList.createSection(
        '✏️ Practice',
        moduleData.practice,
        'practice',
        basePath,
        progressTracker
      );
      container.appendChild(practiceSection);
    }

    return container;
  }

  /**
   * Update activity list with progress information
   * @param {HTMLElement} listElement - Activity list element
   * @param {ProgressTracker} progressTracker - Progress tracker
   */
  static updateProgress(listElement, progressTracker) {
    const type = listElement.getAttribute('data-type');
    const items = listElement.querySelectorAll('li[data-activity-id]');

    items.forEach(item => {
      const activityId = item.getAttribute('data-activity-id');
      const isComplete = progressTracker.isComplete(type, activityId);

      // Remove existing checkmark if present
      const existingCheckmark = item.querySelector('.completion-indicator');
      if (existingCheckmark) {
        existingCheckmark.remove();
      }

      // Add checkmark if complete
      if (isComplete) {
        const checkmark = document.createElement('span');
        checkmark.className = 'completion-indicator';
        checkmark.innerHTML = '✓';
        checkmark.style.color = 'var(--color-success)';
        checkmark.style.marginLeft = 'var(--space-2)';
        checkmark.style.fontWeight = 'bold';
        item.appendChild(checkmark);

        // Add completed class to item
        item.classList.add('completed');
      } else {
        item.classList.remove('completed');
      }
    });
  }

  /**
   * Render activity list into a container
   * @param {string|HTMLElement} container - Container selector or element
   * @param {HTMLElement} activityList - Activity list element to render
   */
  static render(container, activityList) {
    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      console.error('ActivityList: Container not found');
      return;
    }

    if (activityList) {
      containerEl.appendChild(activityList);
    }
  }
}

export default ActivityList;
