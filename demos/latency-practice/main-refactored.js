/**
 * Main entry point for refactored Latency Practice demo
 * Uses shared utilities and configuration-driven approach
 */

import { ProblemEngineRefactored } from './js/ProblemEngineRefactored.js';
import { StudentInterfaceRefactored } from './js/StudentInterfaceRefactored.js';
import { PracticeVisualizationWrapper } from './js/PracticeVisualizationWrapper.js';
import { getAllProblems } from './js/configs/practiceProblems.js';
import { AnimationController } from '../../shared/utils/AnimationController.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing Refactored Latency Practice Demo...');
  
  try {
    // Create problem engine with shared utilities
    const problemEngine = new ProblemEngineRefactored();
    console.log('✅ Problem engine initialized');
    
    // Create student interface with NetworkFormatter
    const studentInterface = new StudentInterfaceRefactored(problemEngine);
    console.log('✅ Student interface initialized');
    
    // Create practice visualization wrapper (hides latency) if canvas exists
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
      const visualizer = new PracticeVisualizationWrapper('network-canvas');
      studentInterface.visualizer = visualizer;
      console.log('✅ Practice visualization wrapper initialized');
    }
    
    // Create animation controller for smooth animations
    const animationController = new AnimationController();
    
    // Load problems from configuration
    const problems = getAllProblems();
    studentInterface.loadProblems(problems);
    console.log(`✅ Loaded ${problems.length} problems from configuration`);
    
    // Load first beginner problem by default
    const beginnerProblems = problems.filter(p => p.difficulty === 'beginner');
    if (beginnerProblems.length > 0) {
      const firstProblem = problemEngine.loadProblem(beginnerProblems[0]);
      studentInterface.displayProblem(firstProblem);
      studentInterface.configureAnswerArea(firstProblem);
      
      // Show answer area
      const answerArea = document.getElementById('answer-area');
      if (answerArea) {
        answerArea.style.display = 'block';
      }
      
      // Visualize if available
      if (studentInterface.visualizer && firstProblem) {
        studentInterface.renderProblemVisualization(firstProblem);
      }
    }
    
    // Add keyboard shortcuts
    setupKeyboardShortcuts(studentInterface);
    
    // Add help system
    setupHelpSystem();
    
    // Log successful initialization
    console.log('✨ Refactored Latency Practice demo ready!');
    
    // Show refactored badge
    showRefactoredBadge();
    
  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    showErrorMessage(error.message);
  }
});

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts(studentInterface) {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to check answer
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const checkButton = document.getElementById('check-answer');
      if (checkButton && !checkButton.disabled) {
        checkButton.click();
      }
    }
    
    // Ctrl/Cmd + H for hint
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      const hintButton = document.getElementById('get-hint');
      if (hintButton && !hintButton.disabled) {
        hintButton.click();
      }
    }
    
    // Ctrl/Cmd + N for next problem
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      const nextButton = document.getElementById('next-problem');
      if (nextButton && nextButton.style.display !== 'none') {
        nextButton.click();
      }
    }
    
    // Ctrl/Cmd + S for show solution
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      const solutionButton = document.getElementById('show-solution');
      if (solutionButton && !solutionButton.disabled) {
        solutionButton.click();
      }
    }
    
    // Ctrl/Cmd + R for random problem
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      if (studentInterface) {
        studentInterface.nextProblem();
      }
    }
  });
}

/**
 * Setup help system
 */
function setupHelpSystem() {
  // Create help tooltip
  const helpTooltip = document.createElement('div');
  helpTooltip.className = 'help-tooltip';
  helpTooltip.innerHTML = `
    <div class="help-header">
      <h4>⌨️ Keyboard Shortcuts</h4>
      <button class="close-help">×</button>
    </div>
    <ul class="help-shortcuts">
      <li><kbd>Ctrl</kbd> + <kbd>Enter</kbd> - Check Answer</li>
      <li><kbd>Ctrl</kbd> + <kbd>H</kbd> - Get Hint</li>
      <li><kbd>Ctrl</kbd> + <kbd>N</kbd> - Next Problem</li>
      <li><kbd>Ctrl</kbd> + <kbd>S</kbd> - Show Solution</li>
      <li><kbd>Ctrl</kbd> + <kbd>R</kbd> - Random Problem</li>
      <li><kbd>Tab</kbd> - Navigate between inputs</li>
      <li><kbd>?</kbd> - Toggle this help</li>
    </ul>
    <div class="help-footer">
      <small>This demo uses shared utilities for consistent calculations</small>
    </div>
  `;
  helpTooltip.style.display = 'none';
  document.body.appendChild(helpTooltip);
  
  // Show/hide help on ? key
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.target.matches('input, select, textarea')) {
      e.preventDefault();
      helpTooltip.style.display = helpTooltip.style.display === 'none' ? 'block' : 'none';
    }
  });
  
  // Close button
  helpTooltip.querySelector('.close-help').addEventListener('click', () => {
    helpTooltip.style.display = 'none';
  });
  
  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!helpTooltip.contains(e.target) && !e.target.matches('.help-button')) {
      helpTooltip.style.display = 'none';
    }
  });
  
  // Add help button to UI
  const helpButton = document.createElement('button');
  helpButton.className = 'help-button';
  helpButton.innerHTML = '?';
  helpButton.title = 'Show keyboard shortcuts (?)';
  helpButton.addEventListener('click', (e) => {
    e.stopPropagation();
    helpTooltip.style.display = helpTooltip.style.display === 'none' ? 'block' : 'none';
  });
  
  // Add to header or controls
  const header = document.querySelector('.demo-header') || document.querySelector('header');
  if (header) {
    header.appendChild(helpButton);
  }
}

/**
 * Show refactored badge
 */
function showRefactoredBadge() {
  const badge = document.createElement('div');
  badge.className = 'refactored-badge';
  badge.innerHTML = `
    <span class="badge-icon">🔧</span>
    <span class="badge-text">Refactored</span>
    <div class="badge-tooltip">
      This demo has been refactored to use:
      <ul>
        <li>Shared DelayCalculator utility</li>
        <li>NetworkFormatter for consistent display</li>
        <li>Configuration-driven problems</li>
        <li>Modular component architecture</li>
      </ul>
    </div>
  `;
  
  document.body.appendChild(badge);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    badge.classList.add('badge-minimized');
  }, 5000);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
  const problemDisplay = document.getElementById('problem-display');
  if (problemDisplay) {
    problemDisplay.innerHTML = `
      <div class="error-message">
        <div class="error-icon">⚠️</div>
        <h2>Initialization Error</h2>
        <p>Failed to initialize the practice demo.</p>
        <p class="error-details">${message}</p>
        <button onclick="location.reload()" class="retry-button">Reload Page</button>
      </div>
    `;
  }
}

// Add styles for refactored version
const style = document.createElement('style');
style.textContent = `
  /* Help System Styles */
  .help-tooltip {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    border: 2px solid #3498db;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    z-index: 1000;
    max-width: 320px;
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .help-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #ecf0f1;
    background: #f8f9fa;
    border-radius: 12px 12px 0 0;
  }
  
  .help-header h4 {
    margin: 0;
    color: #2c3e50;
    font-size: 16px;
  }
  
  .close-help {
    background: none;
    border: none;
    font-size: 24px;
    color: #7f8c8d;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-help:hover {
    color: #2c3e50;
  }
  
  .help-shortcuts {
    margin: 0;
    padding: 16px;
    list-style: none;
  }
  
  .help-shortcuts li {
    margin: 8px 0;
    color: #34495e;
    font-size: 14px;
  }
  
  .help-shortcuts kbd {
    display: inline-block;
    padding: 3px 6px;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-size: 12px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    box-shadow: 0 2px 0 rgba(0,0,0,0.1);
    margin: 0 2px;
  }
  
  .help-footer {
    padding: 8px 16px;
    background: #f8f9fa;
    border-top: 1px solid #ecf0f1;
    border-radius: 0 0 12px 12px;
    text-align: center;
  }
  
  .help-footer small {
    color: #7f8c8d;
    font-size: 11px;
  }
  
  .help-button {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #3498db;
    color: white;
    border: none;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: all 0.2s;
    z-index: 999;
  }
  
  .help-button:hover {
    background: #2980b9;
    transform: scale(1.1);
  }
  
  /* Refactored Badge */
  .refactored-badge {
    position: fixed;
    top: 20px;
    left: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    z-index: 999;
    transition: all 0.3s;
    cursor: pointer;
  }
  
  .refactored-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }
  
  .refactored-badge:hover .badge-tooltip {
    display: block;
  }
  
  .badge-minimized {
    padding: 8px;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    justify-content: center;
  }
  
  .badge-minimized .badge-text {
    display: none;
  }
  
  .badge-icon {
    font-size: 18px;
  }
  
  .badge-tooltip {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    background: white;
    color: #2c3e50;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    width: 280px;
    font-weight: normal;
    font-size: 13px;
  }
  
  .badge-tooltip ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
  }
  
  .badge-tooltip li {
    margin: 4px 0;
  }
  
  /* Error Message Styles */
  .error-message {
    text-align: center;
    padding: 3rem;
    max-width: 500px;
    margin: 2rem auto;
  }
  
  .error-icon {
    font-size: 48px;
    margin-bottom: 1rem;
  }
  
  .error-message h2 {
    color: #e74c3c;
    margin-bottom: 1rem;
  }
  
  .error-details {
    margin: 1rem 0;
    padding: 1rem;
    background: #fff5f5;
    border: 1px solid #ffdddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9rem;
    color: #c0392b;
  }
  
  .retry-button {
    margin-top: 1rem;
    padding: 10px 24px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .retry-button:hover {
    background: #2980b9;
  }
  
  /* Enhanced Input Styles */
  .correct-answer {
    animation: correctPulse 0.5s;
  }
  
  .incorrect-answer {
    animation: incorrectShake 0.5s;
  }
  
  @keyframes correctPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes incorrectShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);