/**
 * LessonNavigator Component
 * Creates navigation controls for moving between lessons, demos, and practice
 */

import { getModuleByNumber, getNextModule, getPreviousModule } from '../constants/modules.js';

export class LessonNavigator {
  /**
   * Create navigation for lessons within a module
   * @param {number} moduleNumber - Current module number
   * @param {string} currentLessonId - Current lesson ID
   * @param {string} [basePath] - Base path for navigation (defaults to current module)
   * @returns {HTMLElement} Navigation element
   */
  static createLessonNav(moduleNumber, currentLessonId, basePath = null) {
    const module = getModuleByNumber(moduleNumber);
    if (!module) return null;

    const currentIndex = module.lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex === -1) return null;

    const prevLesson = currentIndex > 0 ? module.lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < module.lessons.length - 1 ? module.lessons[currentIndex + 1] : null;

    const nav = document.createElement('nav');
    nav.className = 'lesson-nav';

    const base = basePath || `../../`;

    // Previous lesson button
    if (prevLesson) {
      const prevBtn = document.createElement('a');
      prevBtn.href = `${base}lessons/${prevLesson.id}/`;
      prevBtn.className = 'btn btn-secondary';
      prevBtn.innerHTML = `← ${prevLesson.title}`;
      nav.appendChild(prevBtn);
    } else {
      // Placeholder for alignment
      nav.appendChild(document.createElement('div'));
    }

    // Back to module button
    const moduleBtn = document.createElement('a');
    moduleBtn.href = `${base}`;
    moduleBtn.className = 'btn btn-secondary';
    moduleBtn.textContent = 'Module Home';
    nav.appendChild(moduleBtn);

    // Next lesson or demo button
    if (nextLesson) {
      const nextBtn = document.createElement('a');
      nextBtn.href = `${base}lessons/${nextLesson.id}/`;
      nextBtn.className = 'btn btn-primary';
      nextBtn.innerHTML = `${nextLesson.title} →`;
      nav.appendChild(nextBtn);
    } else {
      // Last lesson - suggest first demo
      if (module.demos && module.demos.length > 0) {
        const firstDemo = module.demos[0];
        const demoBtn = document.createElement('a');
        demoBtn.href = `${base}demos/${firstDemo.id}/`;
        demoBtn.className = 'btn btn-primary';
        demoBtn.innerHTML = `Try Demo: ${firstDemo.title} →`;
        nav.appendChild(demoBtn);
      } else {
        nav.appendChild(document.createElement('div'));
      }
    }

    return nav;
  }

  /**
   * Create navigation for demos within a module
   * @param {number} moduleNumber - Current module number
   * @param {string} currentDemoId - Current demo ID
   * @param {string} [basePath] - Base path for navigation
   * @returns {HTMLElement} Navigation element
   */
  static createDemoNav(moduleNumber, currentDemoId, basePath = null) {
    const module = getModuleByNumber(moduleNumber);
    if (!module) return null;

    const nav = document.createElement('nav');
    nav.className = 'demo-navigation';

    const base = basePath || `../../`;

    // Back to module button
    const moduleBtn = document.createElement('a');
    moduleBtn.href = `${base}`;
    moduleBtn.className = 'btn btn-secondary';
    moduleBtn.innerHTML = '← Back to Module';
    nav.appendChild(moduleBtn);

    // Try practice button (if practice exists)
    if (module.practice && module.practice.length > 0) {
      const firstPractice = module.practice[0];
      const practiceBtn = document.createElement('a');
      practiceBtn.href = `${base}practice/${firstPractice.id}/`;
      practiceBtn.className = 'btn btn-primary';
      practiceBtn.innerHTML = `Try Practice Problems →`;
      nav.appendChild(practiceBtn);
    }

    return nav;
  }

  /**
   * Create navigation for practice within a module
   * @param {number} moduleNumber - Current module number
   * @param {string} [basePath] - Base path for navigation
   * @returns {HTMLElement} Navigation element
   */
  static createPracticeNav(moduleNumber, basePath = null) {
    const module = getModuleByNumber(moduleNumber);
    if (!module) return null;

    const nav = document.createElement('nav');
    nav.className = 'practice-navigation';

    const base = basePath || `../../`;

    // Back to module button
    const moduleBtn = document.createElement('a');
    moduleBtn.href = `${base}`;
    moduleBtn.className = 'btn btn-secondary';
    moduleBtn.innerHTML = '← Back to Module';
    nav.appendChild(moduleBtn);

    return nav;
  }

  /**
   * Create module-to-module navigation
   * @param {number} currentModuleNumber - Current module number
   * @returns {HTMLElement} Navigation element
   */
  static createModuleNav(currentModuleNumber) {
    const nav = document.createElement('nav');
    nav.className = 'module-navigation';

    const prevModule = getPreviousModule(currentModuleNumber);
    const nextModule = getNextModule(currentModuleNumber);

    // Previous module button
    if (prevModule) {
      const prevBtn = document.createElement('a');
      prevBtn.href = `../${prevModule.id}/`;
      prevBtn.className = 'btn btn-secondary';
      prevBtn.innerHTML = `← Module ${prevModule.number}: ${prevModule.title}`;
      nav.appendChild(prevBtn);
    } else {
      nav.appendChild(document.createElement('div'));
    }

    // Back to course home button
    const homeBtn = document.createElement('a');
    homeBtn.href = '/';
    homeBtn.className = 'btn btn-secondary';
    homeBtn.textContent = 'Course Home';
    nav.appendChild(homeBtn);

    // Next module button
    if (nextModule) {
      const nextBtn = document.createElement('a');
      nextBtn.href = `../${nextModule.id}/`;
      nextBtn.className = 'btn btn-primary';
      nextBtn.innerHTML = `Module ${nextModule.number}: ${nextModule.title} →`;
      nav.appendChild(nextBtn);
    } else {
      nav.appendChild(document.createElement('div'));
    }

    return nav;
  }

  /**
   * Render navigation into a container
   * @param {string|HTMLElement} container - Container selector or element
   * @param {HTMLElement} navElement - Navigation element to render
   */
  static render(container, navElement) {
    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      console.error('LessonNavigator: Container not found');
      return;
    }

    if (navElement) {
      containerEl.appendChild(navElement);
    }
  }
}

export default LessonNavigator;
