/**
 * Module 4: Network Layer
 * JavaScript for module landing page - populates activities and handles interactions
 */

import { MODULES } from '../../shared/constants/modules.js';
import { Breadcrumb } from '../../shared/components/Breadcrumb.js';
import { ActivityList } from '../../shared/components/ActivityList.js';
import { ProgressTracker } from '../../shared/components/ProgressTracker.js';

// Get Module 4 data
const module4 = MODULES.find(m => m.number === 4);

if (!module4) {
  console.error('Module 4 configuration not found');
}

// Create progress tracker instance
let progressTracker = null;
if (module4) {
  progressTracker = new ProgressTracker(4, module4);
}

// Initialize breadcrumb navigation
function initBreadcrumb() {
  const breadcrumbContainer = document.getElementById('breadcrumb-container');
  if (breadcrumbContainer && module4) {
    const breadcrumb = Breadcrumb.createCustom([
      { label: 'Home', href: '../../index.html' },
      { label: `Module ${module4.number}: ${module4.title}`, href: null }
    ]);
    breadcrumbContainer.appendChild(breadcrumb);
  }
}

// Initialize lessons list
function initLessons() {
  const lessonsContainer = document.getElementById('lessons-list');
  if (!lessonsContainer || !module4 || !progressTracker) return;

  module4.lessons.forEach(lesson => {
    const lessonPath = `./lessons/${lesson.id}/index.html`;
    const isCompleted = progressTracker.isComplete('lessons', lesson.id);

    const item = ActivityList.createItem({
      title: lesson.title,
      url: lessonPath,
      estimatedTime: lesson.estimatedTime,
      isCompleted,
      onClick: (e) => {
        // Track that user visited this lesson
        progressTracker.markComplete('lessons', lesson.id);
      }
    });

    lessonsContainer.appendChild(item);
  });
}

// Initialize demos list
function initDemos() {
  const demosContainer = document.getElementById('demos-list');
  if (!demosContainer || !module4 || !progressTracker) return;

  module4.demos.forEach(demo => {
    const demoPath = `./demos/${demo.id}/index.html`;
    const isCompleted = progressTracker.isComplete('demos', demo.id);
    const status = demo.status || 'planned';

    const item = ActivityList.createItem({
      title: demo.title,
      url: demoPath,
      estimatedTime: demo.estimatedTime,
      isCompleted,
      status,
      onClick: (e) => {
        // Track that user visited this demo
        progressTracker.markComplete('demos', demo.id);
      }
    });

    demosContainer.appendChild(item);
  });
}

// Initialize practice list
function initPractice() {
  const practiceContainer = document.getElementById('practice-list');
  if (!practiceContainer || !module4 || !progressTracker) return;

  module4.practice.forEach(practice => {
    const practicePath = `./practice/${practice.id}/index.html`;
    const isCompleted = progressTracker.isComplete('practice', practice.id);
    const status = practice.status || 'planned';

    const item = ActivityList.createItem({
      title: practice.title,
      url: practicePath,
      estimatedTime: practice.estimatedTime,
      isCompleted,
      status,
      onClick: (e) => {
        // Track that user visited this practice
        progressTracker.markComplete('practice', practice.id);
      }
    });

    practiceContainer.appendChild(item);
  });
}

// Initialize progress tracking
function initProgressTracking() {
  if (!progressTracker) return;

  // Log progress for debugging
  const completed = progressTracker.getCompletedActivities();
  const total = progressTracker.getTotalActivities();
  const percentage = progressTracker.getCompletionPercentage();

  console.log(`Module 4 Progress: ${completed}/${total} (${percentage}%)`);
}

// Initialize keyboard navigation for activity items
function initKeyboardNavigation() {
  document.querySelectorAll('.activity-list li').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const link = item.querySelector('a');
        if (link) {
          link.click();
        }
      }
    });
  });
}

// Main initialization
function init() {
  if (!module4) return;

  initBreadcrumb();
  initLessons();
  initDemos();
  initPractice();
  initProgressTracking();
  initKeyboardNavigation();

  // Add module class for styling
  document.body.classList.add('module-4');
  document.documentElement.style.setProperty('--color-module', module4.color);
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
