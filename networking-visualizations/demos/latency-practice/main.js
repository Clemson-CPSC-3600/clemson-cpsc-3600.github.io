/**
 * Main entry point for the Latency Practice demo
 */
import { ProblemEngine } from './js/ProblemEngine.js';
import { StudentInterface } from './js/StudentInterface.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing Latency Practice...');
  
  // Create problem engine
  const problemEngine = new ProblemEngine();
  
  // Create student interface
  const studentInterface = new StudentInterface(problemEngine);
  
  // Load problems
  try {
    // Load beginner problems
    const response = await fetch('./problems/beginner.json');
    const beginnerProblems = await response.json();
    
    // In the future, we can load intermediate and advanced problems too
    // const intermediateProblems = await fetch('./problems/intermediate.json').then(r => r.json());
    // const advancedProblems = await fetch('./problems/advanced.json').then(r => r.json());
    
    // Combine all problems
    const allProblems = [
      ...beginnerProblems,
      // ...intermediateProblems,
      // ...advancedProblems
    ];
    
    // Load problems into the interface
    studentInterface.loadProblemSet(allProblems);
    
    console.log(`Loaded ${allProblems.length} problems`);
  } catch (error) {
    console.error('Failed to load problems:', error);
    
    // Show error message to user
    const problemDisplay = document.getElementById('problem-display');
    problemDisplay.innerHTML = `
      <div class="error-message">
        <h2>Error Loading Problems</h2>
        <p>Failed to load practice problems. Please refresh the page to try again.</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
  }
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to check answer
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const checkButton = document.getElementById('check-answer');
      if (!checkButton.disabled) {
        checkButton.click();
      }
    }
    
    // Ctrl/Cmd + H for hint
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      const hintButton = document.getElementById('get-hint');
      if (!hintButton.disabled) {
        hintButton.click();
      }
    }
    
    // Ctrl/Cmd + N for next problem
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      const nextButton = document.getElementById('next-problem');
      if (nextButton.style.display !== 'none') {
        nextButton.click();
      }
    }
  });
  
  // Add help tooltip
  const helpTooltip = document.createElement('div');
  helpTooltip.className = 'help-tooltip';
  helpTooltip.innerHTML = `
    <h4>Keyboard Shortcuts:</h4>
    <ul>
      <li><kbd>Ctrl</kbd> + <kbd>Enter</kbd> - Check Answer</li>
      <li><kbd>Ctrl</kbd> + <kbd>H</kbd> - Get Hint</li>
      <li><kbd>Ctrl</kbd> + <kbd>N</kbd> - Next Problem</li>
      <li><kbd>Tab</kbd> - Navigate between inputs</li>
    </ul>
  `;
  helpTooltip.style.display = 'none';
  document.body.appendChild(helpTooltip);
  
  // Show help on ? key
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.target.matches('input')) {
      helpTooltip.style.display = helpTooltip.style.display === 'none' ? 'block' : 'none';
    }
  });
  
  // Click outside to close help
  document.addEventListener('click', (e) => {
    if (!helpTooltip.contains(e.target)) {
      helpTooltip.style.display = 'none';
    }
  });
});

// Add styles for help tooltip
const style = document.createElement('style');
style.textContent = `
  .help-tooltip {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    border: 2px solid #3498db;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    max-width: 300px;
  }
  
  .help-tooltip h4 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
  }
  
  .help-tooltip ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #34495e;
  }
  
  .help-tooltip li {
    margin: 0.25rem 0;
  }
  
  .help-tooltip kbd {
    display: inline-block;
    padding: 2px 6px;
    font-family: monospace;
    font-size: 0.85em;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    box-shadow: 0 1px 0 rgba(0,0,0,0.1);
  }
  
  .error-message {
    text-align: center;
    padding: 2rem;
    color: #e74c3c;
  }
  
  .error-message h2 {
    margin-bottom: 1rem;
  }
  
  .error-details {
    margin-top: 1rem;
    font-family: monospace;
    font-size: 0.9rem;
    color: #7f8c8d;
  }
`;
document.head.appendChild(style);