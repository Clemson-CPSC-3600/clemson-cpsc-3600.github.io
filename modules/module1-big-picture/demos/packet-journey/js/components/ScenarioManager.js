/**
 * ScenarioManager - Manages scenario loading and selection
 * Provides UI for scenario selection and handles scenario data
 */

import { 
  journeyScenarios, 
  getScenario, 
  getAllScenarios,
  getScenariosByDifficulty,
  generateRandomVariation 
} from '../configs/journeyScenarios.js';

export class ScenarioManager {
  constructor(containerId, onScenarioChange) {
    this.container = document.getElementById(containerId);
    this.onScenarioChange = onScenarioChange;
    this.currentScenario = null;
    
    if (this.container) {
      this.createUI();
    }
  }
  
  /**
   * Create the scenario selection UI
   */
  createUI() {
    // Clear existing content
    this.container.innerHTML = '';
    
    // Create scenario selector
    const selectorDiv = document.createElement('div');
    selectorDiv.className = 'scenario-selector';
    selectorDiv.innerHTML = `
      <div class="scenario-controls">
        <div class="scenario-dropdown" style="margin-bottom: 12px;">
          <label for="scenario-select" style="display: block; margin-bottom: 6px; font-weight: 600;">Choose Scenario:</label>
          <select id="scenario-select" class="scenario-select" style="width: 100%;">
            <option value="">-- Select a scenario --</option>
            <optgroup label="Beginner">
              ${this.createOptions('beginner')}
            </optgroup>
            <optgroup label="Intermediate">
              ${this.createOptions('intermediate')}
            </optgroup>
            <optgroup label="Advanced">
              ${this.createOptions('advanced')}
            </optgroup>
          </select>
        </div>
        <div class="scenario-actions" style="display: flex; gap: 8px;">
          <button id="random-variation-btn" class="btn btn-secondary" disabled style="flex: 1; position: relative;" 
                  title="Randomly varies: CPU load (±20%), link utilization (±15%), and processing delays (±30%) to simulate real-world network conditions">
            Generate Variation
            <span class="tooltip-icon" style="display: inline-block; margin-left: 4px; font-size: 12px; opacity: 0.7;">ⓘ</span>
          </button>
          <button id="reset-scenario-btn" class="btn btn-secondary" disabled style="flex: 1;"
                  title="Reset to the original scenario parameters">
            Reset
          </button>
        </div>
      </div>
      <div id="scenario-info" class="scenario-info" style="display: none;">
        <h3 class="scenario-title"></h3>
        <p class="scenario-description"></p>
        <div class="scenario-stats">
          <span class="stat-item">
            <strong>Hops:</strong> <span id="hop-count">0</span>
          </span>
          <span class="stat-item">
            <strong>Difficulty:</strong> <span id="difficulty-level">-</span>
          </span>
        </div>
      </div>
    `;
    
    this.container.appendChild(selectorDiv);
    
    // Add styles if not already present
    this.injectStyles();
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  /**
   * Create option elements for scenarios
   */
  createOptions(difficulty) {
    const scenarios = getScenariosByDifficulty(difficulty);
    return scenarios.map(scenario => 
      `<option value="${scenario.id}">${scenario.name}</option>`
    ).join('');
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const select = document.getElementById('scenario-select');
    const variationBtn = document.getElementById('random-variation-btn');
    const resetBtn = document.getElementById('reset-scenario-btn');
    
    if (select) {
      select.addEventListener('change', (e) => {
        const scenarioId = e.target.value;
        if (scenarioId) {
          this.loadScenario(scenarioId);
        } else {
          this.clearScenario();
        }
      });
    }
    
    if (variationBtn) {
      variationBtn.addEventListener('click', () => {
        if (this.currentScenario) {
          this.generateVariation();
        }
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.currentScenario) {
          const select = document.getElementById('scenario-select');
          this.loadScenario(select.value);
        }
      });
    }
  }
  
  /**
   * Load a scenario
   */
  loadScenario(scenarioId) {
    const scenario = getScenario(scenarioId);
    if (!scenario) {
      console.error(`Scenario '${scenarioId}' not found`);
      return;
    }
    
    this.currentScenario = scenario;
    this.displayScenarioInfo(scenario);
    
    // Enable action buttons
    document.getElementById('random-variation-btn').disabled = false;
    document.getElementById('reset-scenario-btn').disabled = false;
    
    // Notify listener
    if (this.onScenarioChange) {
      this.onScenarioChange(scenario);
    }
  }
  
  /**
   * Generate a random variation of current scenario
   */
  generateVariation() {
    if (!this.currentScenario) return;
    
    const variation = generateRandomVariation(this.currentScenario.id);
    if (variation) {
      this.currentScenario = variation;
      this.displayScenarioInfo(variation);
      
      if (this.onScenarioChange) {
        this.onScenarioChange(variation);
      }
    }
  }
  
  /**
   * Display scenario information
   */
  displayScenarioInfo(scenario) {
    const infoDiv = document.getElementById('scenario-info');
    if (!infoDiv) return;
    
    infoDiv.style.display = 'block';
    
    // Update title and description
    const title = infoDiv.querySelector('.scenario-title');
    const description = infoDiv.querySelector('.scenario-description');
    
    if (title) title.textContent = scenario.name;
    if (description) description.textContent = scenario.description;
    
    // Update stats
    document.getElementById('hop-count').textContent = scenario.hops.length;
    document.getElementById('difficulty-level').textContent = 
      scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1);
    
    // Add difficulty class for styling
    infoDiv.className = `scenario-info difficulty-${scenario.difficulty}`;
  }
  
  /**
   * Clear scenario display
   */
  clearScenario() {
    this.currentScenario = null;
    
    const infoDiv = document.getElementById('scenario-info');
    if (infoDiv) {
      infoDiv.style.display = 'none';
    }
    
    // Disable action buttons
    document.getElementById('random-variation-btn').disabled = true;
    document.getElementById('reset-scenario-btn').disabled = true;
    
    if (this.onScenarioChange) {
      this.onScenarioChange(null);
    }
  }
  
  /**
   * Get current scenario
   */
  getCurrentScenario() {
    return this.currentScenario;
  }
  
  /**
   * Load default scenario
   */
  loadDefault() {
    // Load the first beginner scenario by default
    const beginnerScenarios = getScenariosByDifficulty('beginner');
    if (beginnerScenarios.length > 0) {
      const defaultScenario = beginnerScenarios[0];
      
      // Set the select value
      const select = document.getElementById('scenario-select');
      if (select) {
        select.value = defaultScenario.id;
      }
      
      this.loadScenario(defaultScenario.id);
    }
  }
  
  /**
   * Inject styles for the scenario manager
   */
  injectStyles() {
    if (document.querySelector('style[data-scenario-manager]')) return;
    
    const style = document.createElement('style');
    style.setAttribute('data-scenario-manager', 'true');
    style.textContent = `
      .scenario-selector {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
        overflow: visible;
        position: relative;
      }
      
      .scenario-controls {
        display: block;
        margin-bottom: 16px;
      }
      
      .scenario-dropdown {
        width: 100%;
        margin-bottom: 12px;
      }
      
      .scenario-dropdown label {
        display: block;
        margin-bottom: 4px;
        font-weight: 600;
        color: #495057;
        font-size: 14px;
      }
      
      .scenario-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 14px;
        background: white;
        cursor: pointer;
      }
      
      .scenario-select:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
      }
      
      .scenario-actions {
        display: flex;
        gap: 8px;
        position: relative;
        overflow: visible;
        margin-bottom: 40px; /* Extra space for tooltip */
      }
      
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
      
      .btn-secondary:hover:not(:disabled) {
        background: #5a6268;
      }
      
      .scenario-info {
        background: white;
        border-radius: 4px;
        padding: 12px;
      }
      
      .scenario-title {
        margin: 0 0 8px 0;
        color: #212529;
        font-size: 18px;
      }
      
      .scenario-description {
        margin: 0 0 12px 0;
        color: #6c757d;
        font-size: 14px;
      }
      
      .scenario-stats {
        display: flex;
        gap: 24px;
        font-size: 13px;
      }
      
      .stat-item {
        color: #495057;
      }
      
      .stat-item strong {
        color: #212529;
        margin-right: 4px;
      }
      
      /* Enhanced tooltip styling */
      .btn[title] {
        cursor: help;
        position: relative;
        overflow: visible;
      }
      
      .btn[title]:hover::after {
        content: attr(title);
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        transform: none;
        padding: 10px 12px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-size: 12px;
        border-radius: 6px;
        white-space: normal;
        width: 280px;
        text-align: left;
        z-index: 10000;
        pointer-events: none;
        line-height: 1.5;
        font-weight: normal;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      
      .btn[title]:hover::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 30px;
        transform: none;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid rgba(0, 0, 0, 0.95);
        z-index: 10001;
        pointer-events: none;
      }
      
      .tooltip-icon {
        pointer-events: none;
      }
      
      .difficulty-beginner .scenario-title {
        color: #28a745;
      }
      
      .difficulty-intermediate .scenario-title {
        color: #ffc107;
      }
      
      .difficulty-advanced .scenario-title {
        color: #dc3545;
      }
    `;
    
    document.head.appendChild(style);
  }
}