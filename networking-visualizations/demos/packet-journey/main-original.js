import { NetworkPath } from './js/NetworkPath.js';
import { PacketJourneyVisualization } from './js/Visualization.js';
import { HopControls } from './js/Controls.js';

// Global instances
let networkPath;
let visualization;
let hopControls;
let currentLatencyData = null;

/**
 * Initialize the demo
 */
function init() {
  // Create network path with default configuration
  networkPath = new NetworkPath();
  
  // Create visualization
  visualization = new PacketJourneyVisualization('network-canvas');
  
  // Create hop controls (but don't display them)
  hopControls = new HopControls(networkPath, () => {
    calculateAndDisplay();
  });
  
  // Don't insert hop controls into the page
  // insertHopControls();
  
  // Set up event listeners
  setupEventListeners();
  
  // Calculate initial latency (this will also render the path)
  performCalculation();
}

/**
 * Insert hop controls into the DOM
 */
function insertHopControls() {
  // Find or create container for hop controls
  let controlsContainer = document.getElementById('hop-controls-section');
  if (!controlsContainer) {
    // Create it after the suitable apps panel
    const suitableApps = document.getElementById('suitable-apps');
    if (suitableApps) {
      controlsContainer = document.createElement('div');
      controlsContainer.id = 'hop-controls-section';
      controlsContainer.className = 'hop-controls-section';
      suitableApps.parentNode.insertBefore(controlsContainer, suitableApps.nextSibling);
    }
  }
  
  if (controlsContainer) {
    controlsContainer.innerHTML = hopControls.createHopControlsPanel();
    hopControls.bindEvents(controlsContainer);
  }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Preset selector
  const presetSelect = document.getElementById('preset-select');
  presetSelect.addEventListener('change', (e) => {
    networkPath.loadPreset(e.target.value);
    // Automatically calculate with new preset
    performCalculation(); // Use performCalculation directly to avoid debounce
  });
  
  // Packet size slider
  const packetSizeSlider = document.getElementById('packet-size');
  const packetSizeValue = document.getElementById('packet-size-value');
  
  packetSizeSlider.addEventListener('input', (e) => {
    packetSizeValue.textContent = e.target.value;
    // Automatically recalculate latency when packet size changes
    calculateAndDisplay();
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    visualization.handleResize();
    if (currentLatencyData) {
      visualization.renderPath(networkPath, currentLatencyData);
    } else {
      visualization.renderPath(networkPath);
    }
  });
}

// Debounce timer for auto-calculation
let calculateDebounceTimer = null;

/**
 * Calculate latency and update display
 */
function calculateAndDisplay() {
  // Clear any existing debounce timer
  if (calculateDebounceTimer) {
    clearTimeout(calculateDebounceTimer);
  }
  
  // Debounce the calculation for smooth user experience
  calculateDebounceTimer = setTimeout(() => {
    performCalculation();
  }, 150); // Small delay for smooth interaction
}

/**
 * Actually perform the calculation
 */
function performCalculation() {
  // Get packet size
  const packetSize = parseInt(document.getElementById('packet-size').value);
  
  // Calculate latency
  currentLatencyData = networkPath.calculateTotalLatency(packetSize);
  
  // Find bottleneck
  const bottleneck = networkPath.findBottleneck(packetSize);
  
  // Update visualization with latency data
  visualization.renderPath(networkPath, currentLatencyData);
  
  // Update results summary
  updateResultsSummary(currentLatencyData, bottleneck);
  
  // Update component breakdown
  updateComponentBreakdown(currentLatencyData.components);
  
  // Update detailed breakdown table
  updateBreakdownTable(currentLatencyData.breakdown);
  
  // Update hop latency displays in controls
  if (hopControls) {
    hopControls.updateLatencyDisplays(currentLatencyData);
    // Also update the control panel values to reflect any changes from popup
    for (let i = 0; i < networkPath.hops.length; i++) {
      hopControls.updateControlDisplays(i);
    }
  }
  
  // Show all result panels
  document.getElementById('results-summary').style.display = 'block';
  document.getElementById('component-breakdown').style.display = 'block';
  document.getElementById('detailed-breakdown').style.display = 'block';
}

// Expose calculateAndDisplay to window for popup to use
window.calculateAndDisplay = calculateAndDisplay;

/**
 * Update the results summary panel
 */
function updateResultsSummary(latencyData, bottleneck) {
  // Total latency
  const totalElement = document.getElementById('total-latency');
  totalElement.textContent = `${latencyData.total.toFixed(2)} ms`;
  totalElement.className = 'value';
  
  // Add color based on value
  if (latencyData.total < 30) {
    totalElement.style.color = '#2ecc71';
  } else if (latencyData.total < 60) {
    totalElement.style.color = '#3498db';
  } else if (latencyData.total < 100) {
    totalElement.style.color = '#f39c12';
  } else {
    totalElement.style.color = '#e74c3c';
  }
  
  // Quality rating
  const qualityElement = document.getElementById('quality-rating');
  qualityElement.textContent = latencyData.summary.quality;
  qualityElement.className = `value quality-${latencyData.summary.quality.toLowerCase()}`;
  
  // Bottleneck
  const bottleneckElement = document.getElementById('bottleneck-hop');
  if (bottleneck && bottleneck.hop) {
    bottleneckElement.textContent = `${bottleneck.hop.name} (${bottleneck.latency.toFixed(1)}ms)`;
  } else {
    bottleneckElement.textContent = 'None identified';
  }
}

/**
 * Update the component breakdown panel
 */
function updateComponentBreakdown(components) {
  document.getElementById('total-transmission').textContent = 
    `${components.transmission.toFixed(2)} ms`;
  document.getElementById('total-propagation').textContent = 
    `${components.propagation.toFixed(2)} ms`;
  document.getElementById('total-processing').textContent = 
    `${components.processing.toFixed(2)} ms`;
  document.getElementById('total-queuing').textContent = 
    `${components.queuing.toFixed(2)} ms`;
}

// Removed updateSuitableApps function as the Suitable For section was removed

/**
 * Update the detailed breakdown table
 */
function updateBreakdownTable(breakdown) {
  const tbody = document.getElementById('breakdown-tbody');
  tbody.innerHTML = '';
  
  breakdown.forEach((hop, index) => {
    const hopData = networkPath.hops[index];
    
    // Main row
    const row = document.createElement('tr');
    row.className = 'hop-row clickable';
    row.dataset.hopIndex = index;
    
    // Highlight bottleneck row
    const isBottleneck = Math.max(...breakdown.map(h => h.latencies.total)) === hop.latencies.total;
    if (isBottleneck) {
      row.style.backgroundColor = '#fff3cd';
    }
    
    row.innerHTML = `
      <td><span class="expand-icon">▶</span> ${hop.hopNumber}</td>
      <td>${hop.hopName}</td>
      <td>${hop.latencies.transmission.toFixed(2)}ms</td>
      <td>${hop.latencies.propagation.toFixed(2)}ms</td>
      <td>${hop.latencies.processing.toFixed(2)}ms</td>
      <td>${hop.latencies.queuing.toFixed(2)}ms</td>
      <td><strong>${hop.latencies.total.toFixed(2)}ms</strong></td>
      <td><strong>${hop.cumulative.toFixed(2)}ms</strong></td>
    `;
    
    // Add click handler to toggle equations
    row.addEventListener('click', () => toggleEquations(index));
    
    tbody.appendChild(row);
    
    // Equations detail row (hidden by default)
    const equationsRow = document.createElement('tr');
    equationsRow.className = 'equations-row';
    equationsRow.id = `equations-${index}`;
    equationsRow.style.display = 'none';
    
    equationsRow.innerHTML = `
      <td colspan="8">
        <div class="equations-container">
          ${generateEquationsHTML(hopData, hop.latencies)}
        </div>
      </td>
    `;
    
    tbody.appendChild(equationsRow);
  });
}

/**
 * Toggle equation details for a hop
 */
function toggleEquations(hopIndex) {
  const equationsRow = document.getElementById(`equations-${hopIndex}`);
  const hopRow = document.querySelector(`[data-hop-index="${hopIndex}"]`);
  const expandIcon = hopRow.querySelector('.expand-icon');
  
  if (equationsRow.style.display === 'none') {
    equationsRow.style.display = 'table-row';
    expandIcon.textContent = '▼';
    hopRow.classList.add('expanded');
  } else {
    equationsRow.style.display = 'none';
    expandIcon.textContent = '▶';
    hopRow.classList.remove('expanded');
  }
}

/**
 * Generate HTML for equations display
 */
function generateEquationsHTML(hop, latencies) {
  const packetSize = parseInt(document.getElementById('packet-size').value);
  const packetSizeBits = packetSize * 8;
  
  // Get the actual values used in calculations
  const bandwidth = hop.link.bandwidth;
  const effectiveBandwidth = bandwidth * (1 - hop.link.utilization);
  const distance = hop.link.distance;
  const signalSpeed = {
    'fiber': 200000,
    'copper': 180000,
    'wifi': 300000,
    'satellite': 300000
  }[hop.link.medium];
  
  // Use link utilization directly for queuing
  const utilization = hop.link.utilization;
  
  return `
    <div class="equations-grid">
      <!-- Transmission Delay -->
      <div class="equation-box">
        <h4>🔷 Transmission Delay</h4>
        <div class="equation">
          <div class="formula">
            <span class="math">Transmission = Packet Size / Effective Bandwidth</span>
          </div>
          <div class="calculation">
            <span class="math">= (${packetSize} bytes × 8 bits/byte) / (${(bandwidth/1_000_000).toFixed(0)} Mbps × ${((1-hop.link.utilization)*100).toFixed(0)}%)</span>
          </div>
          <div class="calculation">
            <span class="math">= ${packetSizeBits} bits / ${(effectiveBandwidth/1_000_000).toFixed(0)} Mbps</span>
          </div>
          <div class="result">
            <span class="math">= ${latencies.transmission.toFixed(3)} ms</span>
          </div>
        </div>
        <div class="explanation">
          Time to serialize all ${packetSizeBits} bits onto a ${(bandwidth/1_000_000).toFixed(0)} Mbps link 
          with ${(hop.link.utilization*100).toFixed(0)}% utilization
        </div>
      </div>
      
      <!-- Propagation Delay -->
      <div class="equation-box">
        <h4>🟢 Propagation Delay</h4>
        <div class="equation">
          <div class="formula">
            <span class="math">Propagation = Distance / Signal Speed</span>
          </div>
          <div class="calculation">
            <span class="math">= ${distance} km / ${(signalSpeed/1000).toFixed(0)},000 km/s</span>
          </div>
          ${hop.link.medium === 'satellite' ? `
          <div class="calculation satellite">
            <span class="math">+ 71,572 km round trip to GEO satellite</span>
          </div>
          ` : ''}
          <div class="result">
            <span class="math">= ${latencies.propagation.toFixed(3)} ms</span>
          </div>
        </div>
        <div class="explanation">
          Signal travels at ${((signalSpeed/300000)*100).toFixed(0)}% speed of light through ${hop.link.medium}
        </div>
      </div>
      
      <!-- Processing Delay -->
      <div class="equation-box">
        <h4>🟠 Processing Delay</h4>
        <div class="equation">
          <div class="formula">
            <span class="math">Processing = Base Time × Power Factor × Load Factor</span>
          </div>
          <div class="calculation">
            <span class="math">= ${(hop.device.processingTimeBase*1000).toFixed(1)} ms × ${
              hop.device.processingPower === 'low' ? '3.0' : 
              hop.device.processingPower === 'medium' ? '1.5' : '1.0'
            } × (1 + ${hop.device.currentLoad.toFixed(1)} × 2)</span>
          </div>
          <div class="result">
            <span class="math">= ${latencies.processing.toFixed(3)} ms</span>
          </div>
        </div>
        <div class="explanation">
          ${hop.device.processingPower} power device at ${(hop.device.currentLoad*100).toFixed(0)}% CPU load
        </div>
      </div>
      
      <!-- Queuing Delay -->
      <div class="equation-box">
        <h4>🔴 Queuing Delay</h4>
        <div class="equation">
          <div class="formula">
            <span class="math">Queuing Delay (ms) = (1/(1-x)³) - 1</span>
          </div>
          <div class="calculation">
            <span class="math">where x = link utilization (from Link Properties above)</span>
          </div>
          <div class="calculation">
            <span class="math">x = Link Utilization = ${utilization.toFixed(3)} (${(utilization * 100).toFixed(1)}%)</span>
          </div>
          ${utilization < 0.95 ? `
          <div class="calculation">
            <span class="math">Queuing Delay = 1/(1 - ${utilization.toFixed(3)})³ - 1</span>
          </div>
          <div class="calculation">
            <span class="math">= 1/${Math.pow(1-utilization, 3).toFixed(4)} - 1</span>
          </div>
          <div class="calculation">
            <span class="math">= ${(1/Math.pow(1-utilization, 3)).toFixed(3)} - 1</span>
          </div>
          ` : `
          <div class="calculation">
            <span class="math">Queue unstable! (x ≥ 0.95) - Using max delay</span>
          </div>
          `}
          <div class="result">
            <span class="math">= ${latencies.queuing.toFixed(3)} ms</span>
          </div>
        </div>
        <div class="explanation">
          Link at ${(utilization*100).toFixed(1)}% utilization. 
          Queuing delay depends only on link utilization, not packet size.
          ${utilization > 0.8 ? '<br><strong>⚠️ High utilization causing significant queuing!</strong>' : ''}
        </div>
      </div>
    </div>
  `;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);