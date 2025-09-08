/**
 * Main entry point for Packet Journey demo - REFACTORED VERSION
 * Uses the new modular components and configuration-driven scenarios
 */

import { PacketJourneyVisualization } from './js/VisualizationRefactored.js';
import { ScenarioManager } from './js/components/ScenarioManager.js';
import { DelayCalculator } from '../../shared/utils/DelayCalculator.js';
import { NetworkFormatter } from '../../shared/utils/NetworkFormatter.js';

// Global instances
let visualization;
let scenarioManager;
let currentScenario = null;

/**
 * Initialize the demo
 */
function init() {
  console.log('🚀 Initializing refactored Packet Journey demo...');
  
  try {
    // Create visualization with new refactored components
    visualization = new PacketJourneyVisualization('network-canvas');
    console.log('✅ Visualization initialized');
    
    // Create scenario manager
    const scenarioContainer = document.getElementById('scenario-controls');
    if (!scenarioContainer) {
      // Create container if it doesn't exist
      const controlPanel = document.querySelector('.control-panel');
      if (controlPanel) {
        const div = document.createElement('div');
        div.id = 'scenario-controls';
        controlPanel.insertBefore(div, controlPanel.firstChild.nextSibling);
      }
    }
    
    scenarioManager = new ScenarioManager('scenario-controls', (scenario) => {
      handleScenarioChange(scenario);
    });
    console.log('✅ Scenario manager initialized');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load default scenario
    scenarioManager.loadDefault();
    console.log('✅ Default scenario loaded');
    
    // Hide old controls that aren't needed with new system
    hideOldControls();
    
  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    showError('Failed to initialize visualization. Please check the console for details.');
  }
}

/**
 * Handle scenario change
 */
function handleScenarioChange(scenario) {
  if (!scenario) {
    visualization.clear();
    hideResults();
    return;
  }
  
  console.log('📋 Loading scenario:', scenario.name);
  console.log('Scenario data:', scenario);
  console.log('First hop utilization:', scenario.hops[0]?.utilization);
  currentScenario = scenario;
  
  // Packet size is fixed at standard MTU of 1500 bytes
  
  // Render the scenario
  renderScenario();
}

/**
 * Render the current scenario
 */
function renderScenario() {
  if (!currentScenario) return;
  
  try {
    // Prepare path data for visualization
    const path = {
      hops: currentScenario.hops
    };
    
    // Render visualization
    visualization.render(path);
    
    // Calculate and display results
    calculateAndDisplayResults();
    
  } catch (error) {
    console.error('❌ Failed to render scenario:', error);
    showError('Failed to render scenario. Please try another one.');
  }
}

/**
 * Calculate and display latency results
 */
function calculateAndDisplayResults() {
  if (!currentScenario) return;
  
  // Calculate total latency using shared DelayCalculator
  const packetSize = 1500; // Standard MTU
  let totalDelay = 0;
  let delayBreakdown = {
    transmission: 0,
    propagation: 0,
    processing: 0,
    queuing: 0
  };
  
  currentScenario.hops.forEach((hop, index) => {
    if (index === currentScenario.hops.length - 1) return; // Skip last node
    
    const delays = DelayCalculator.calculateHopDelays(hop, packetSize);
    totalDelay += delays.total;
    delayBreakdown.transmission += delays.transmission || 0;
    delayBreakdown.propagation += delays.propagation || 0;
    delayBreakdown.processing += delays.processing || 0;
    delayBreakdown.queuing += delays.queuing || 0;
  });
  
  // Display results
  displayResults(totalDelay, delayBreakdown);
}

/**
 * Display calculation results
 */
function displayResults(totalDelay, breakdown) {
  const resultsPanel = document.getElementById('results-summary');
  if (!resultsPanel) return;
  
  resultsPanel.style.display = 'block';
  
  // Update total latency
  const totalElement = document.getElementById('total-latency');
  if (totalElement) {
    totalElement.textContent = NetworkFormatter.time(totalDelay);
  }
  
  // Update latency quality indicator
  const qualityElement = document.getElementById('latency-quality');
  if (qualityElement) {
    const quality = NetworkFormatter.latencyQuality(totalDelay);
    qualityElement.textContent = quality;
    qualityElement.className = `quality-indicator quality-${quality.toLowerCase()}`;
  }
  
  // Update breakdown if elements exist
  updateBreakdownDisplay(breakdown);
  
  // Update suitable apps
  updateSuitableApps(totalDelay);
}

/**
 * Update breakdown display
 */
function updateBreakdownDisplay(breakdown) {
  const elements = {
    'breakdown-transmission': breakdown.transmission,
    'breakdown-propagation': breakdown.propagation,
    'breakdown-processing': breakdown.processing,
    'breakdown-queuing': breakdown.queuing
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = NetworkFormatter.time(value);
    }
  });
}

/**
 * Update suitable applications display
 */
function updateSuitableApps(totalDelay) {
  const appsPanel = document.getElementById('suitable-apps');
  if (!appsPanel) return;
  
  let apps = [];
  if (totalDelay < 30) {
    apps = ['✅ Real-time Gaming', '✅ Video Calls', '✅ VoIP', '✅ All Applications'];
  } else if (totalDelay < 60) {
    apps = ['✅ Video Calls', '✅ VoIP', '✅ Web Browsing', '⚠️ Competitive Gaming'];
  } else if (totalDelay < 100) {
    apps = ['✅ Web Browsing', '✅ Email', '⚠️ Video Calls', '❌ Gaming'];
  } else if (totalDelay < 200) {
    apps = ['✅ Web Browsing', '✅ Email', '❌ Video Calls', '❌ Gaming'];
  } else {
    apps = ['⚠️ Web Browsing', '✅ Email', '❌ Real-time Applications'];
  }
  
  const appsList = appsPanel.querySelector('.apps-list');
  if (appsList) {
    appsList.innerHTML = apps.map(app => `<div class="app-item">${app}</div>`).join('');
  }
}

/**
 * Hide results panel
 */
function hideResults() {
  const resultsPanel = document.getElementById('results-summary');
  if (resultsPanel) {
    resultsPanel.style.display = 'none';
  }
}

/**
 * Hide old controls that are replaced by new system
 */
function hideOldControls() {
  // Hide the old preset selector since we have scenario manager
  const presetGroup = document.querySelector('#preset-select')?.closest('.control-group');
  if (presetGroup) {
    presetGroup.style.display = 'none';
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Packet size is fixed at 1500 bytes - no controls needed
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (visualization && currentScenario) {
      visualization.handleResize();
    }
  });
}

/**
 * Show error message
 */
function showError(message) {
  console.error(message);
  
  // Try to display error in UI
  const canvas = document.getElementById('network-canvas');
  if (canvas && canvas.parentElement) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #e74c3c;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
    `;
    errorDiv.textContent = message;
    canvas.parentElement.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

/**
 * Log component status for debugging
 */
function logComponentStatus() {
  console.group('🔍 Refactored Components Status');
  console.log('Visualization:', visualization ? '✅ Loaded' : '❌ Not loaded');
  console.log('ScenarioManager:', scenarioManager ? '✅ Loaded' : '❌ Not loaded');
  console.log('Current Scenario:', currentScenario ? currentScenario.name : 'None');
  
  if (visualization && visualization.orchestrator) {
    console.log('Orchestrator:', '✅ Active');
    console.log('Components:', {
      pathRenderer: visualization.orchestrator.pathRenderer ? '✅' : '❌',
      latencyVisualizer: visualization.orchestrator.latencyVisualizer ? '✅' : '❌',
      popupManager: visualization.orchestrator.popupManager ? '✅' : '❌',
      tooltipManager: visualization.orchestrator.tooltipManager ? '✅' : '❌'
    });
  }
  console.groupEnd();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

