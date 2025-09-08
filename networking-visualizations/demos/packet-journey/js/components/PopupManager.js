/**
 * PopupManager - Manages popup creation, positioning, and interactions
 * Handles the detailed link property popup for packet-journey demo
 */

import { NetworkFormatter } from '../../../../shared/utils/NetworkFormatter.js';
import { DelayCalculator } from '../../../../shared/utils/DelayCalculator.js';
import { COLORS } from '../../../../shared/constants/colors.js';

export class PopupManager {
  constructor() {
    this.popup = null;
    this.currentRegion = null;
    this.currentHop = null;
    this.onUpdate = null; // Callback when popup values change
    
    this.createPopup();
    this.bindPopupEvents();
  }
  
  /**
   * Create the popup DOM element
   */
  createPopup() {
    this.popup = document.createElement('div');
    this.popup.className = 'link-popup';
    this.popup.style.display = 'none';
    this.popup.innerHTML = this.getPopupHTML();
    document.body.appendChild(this.popup);
  }
  
  /**
   * Get the HTML structure for the popup
   */
  getPopupHTML() {
    return `
      <div class="popup-header">
        <h3 id="popup-title">Link Properties</h3>
        <button class="popup-close" id="popup-close">×</button>
      </div>
      <div class="popup-content">
        <div class="popup-section">
          <h4>🔷 Link Properties</h4>
          <div class="popup-grid">
            <div class="popup-field">
              <label>Bandwidth:</label>
              <div class="slider-container">
                <input type="range" id="popup-bandwidth" min="0" max="4" step="0.1">
                <span id="popup-bandwidth-value">100 Mbps</span>
              </div>
            </div>
            <div class="popup-field">
              <label>Distance:</label>
              <div class="slider-container">
                <input type="range" id="popup-distance" min="-1" max="3" step="0.1">
                <span id="popup-distance-value">10 km</span>
              </div>
            </div>
            <div class="popup-field">
              <label>Medium:</label>
              <select id="popup-medium">
                <option value="fiber">Fiber Optic</option>
                <option value="copper">Copper Cable</option>
                <option value="wifi">WiFi</option>
                <option value="satellite">Satellite</option>
              </select>
            </div>
            <div class="popup-field">
              <label>Link Utilization:</label>
              <div class="slider-container">
                <input type="range" id="popup-utilization" min="0" max="0.95" step="0.01">
                <span id="popup-utilization-value">50%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="popup-section">
          <h4>🟠 Device Properties</h4>
          <div class="popup-grid">
            <div class="popup-field">
              <label>Processing Power:</label>
              <select id="popup-processing-power">
                <option value="high">High Performance</option>
                <option value="medium">Medium Performance</option>
                <option value="low">Low Performance</option>
              </select>
            </div>
            <div class="popup-field">
              <label>CPU Load:</label>
              <div class="slider-container">
                <input type="range" id="popup-cpu-load" min="0" max="1" step="0.01">
                <span id="popup-cpu-load-value">50%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="popup-section">
          <h4>📊 Queue Analysis</h4>
          <div class="popup-info">
            <div class="info-row">
              <span>Service Rate:</span>
              <span id="popup-service-rate">83,333 packets/sec</span>
            </div>
            <div class="info-row">
              <span>Queue Utilization:</span>
              <span id="popup-queue-utilization" class="utilization-good">50%</span>
            </div>
            <div class="info-row">
              <span>Queue Status:</span>
              <span id="popup-queue-status" class="status-stable">Stable</span>
            </div>
          </div>
        </div>
        
        <div class="popup-section">
          <h4>⏱️ Latency Preview</h4>
          <div class="latency-breakdown" id="popup-latency-breakdown">
            <div class="latency-item">
              <span class="latency-label">Transmission:</span>
              <span class="latency-value" id="popup-transmission">0.12 ms</span>
            </div>
            <div class="latency-item">
              <span class="latency-label">Propagation:</span>
              <span class="latency-value" id="popup-propagation">0.05 ms</span>
            </div>
            <div class="latency-item">
              <span class="latency-label">Processing:</span>
              <span class="latency-value" id="popup-processing">0.50 ms</span>
            </div>
            <div class="latency-item">
              <span class="latency-label">Queuing:</span>
              <span class="latency-value" id="popup-queuing">1.00 ms</span>
            </div>
            <div class="latency-total">
              <span class="latency-label">Total:</span>
              <span class="latency-value" id="popup-total">1.67 ms</span>
            </div>
          </div>
        </div>
        
        <div class="popup-actions">
          <button id="popup-apply" class="btn-primary">Apply Changes</button>
          <button id="popup-cancel" class="btn-secondary">Cancel</button>
        </div>
      </div>
    `;
  }
  
  /**
   * Bind event handlers for popup controls
   */
  bindPopupEvents() {
    // Close button
    const closeBtn = this.popup.querySelector('#popup-close');
    closeBtn.addEventListener('click', () => this.hide());
    
    // Cancel button
    const cancelBtn = this.popup.querySelector('#popup-cancel');
    cancelBtn.addEventListener('click', () => this.hide());
    
    // Apply button
    const applyBtn = this.popup.querySelector('#popup-apply');
    applyBtn.addEventListener('click', () => this.applyChanges());
    
    // Bandwidth slider
    const bandwidthSlider = this.popup.querySelector('#popup-bandwidth');
    bandwidthSlider.addEventListener('input', (e) => this.handleRangeInput(e));
    
    // Distance slider
    const distanceSlider = this.popup.querySelector('#popup-distance');
    distanceSlider.addEventListener('input', (e) => this.handleRangeInput(e));
    
    // Utilization slider
    const utilizationSlider = this.popup.querySelector('#popup-utilization');
    utilizationSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      const display = this.popup.querySelector('#popup-utilization-value');
      display.textContent = NetworkFormatter.percentage(value);
      this.updatePreview();
    });
    
    // CPU load slider
    const cpuLoadSlider = this.popup.querySelector('#popup-cpu-load');
    cpuLoadSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      const display = this.popup.querySelector('#popup-cpu-load-value');
      display.textContent = NetworkFormatter.percentage(value);
      this.updatePreview();
    });
    
    // Medium select
    const mediumSelect = this.popup.querySelector('#popup-medium');
    mediumSelect.addEventListener('change', () => this.updatePreview());
    
    // Processing power select
    const powerSelect = this.popup.querySelector('#popup-processing-power');
    powerSelect.addEventListener('change', () => this.updatePreview());
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (this.popup.style.display !== 'none' && 
          !this.popup.contains(e.target) && 
          e.target.className !== 'link-region') {
        this.hide();
      }
    });
  }
  
  /**
   * Handle range input with logarithmic scaling
   */
  handleRangeInput(event) {
    const input = event.target;
    const value = parseFloat(input.value);
    const display = this.popup.querySelector(`#${input.id}-value`);
    
    if (input.id === 'popup-bandwidth') {
      const bps = this.getPopupValue('bandwidth', true);
      display.textContent = NetworkFormatter.bandwidth(bps);
    } else if (input.id === 'popup-distance') {
      const meters = this.getPopupValue('distance', true);
      display.textContent = NetworkFormatter.distance(meters * 1000); // Convert km to m
    }
    
    this.updatePreview();
  }
  
  /**
   * Get value from popup control with logarithmic scaling if needed
   */
  getPopupValue(param, isLogScale) {
    const input = this.popup.querySelector(`#popup-${param}`);
    const value = parseFloat(input.value);
    
    if (isLogScale) {
      return Math.pow(10, value);
    }
    return value;
  }
  
  /**
   * Update the latency preview based on current popup values
   */
  updatePreview() {
    if (!this.currentHop) return;
    
    // Get current values from popup
    const bandwidth = this.getPopupValue('bandwidth', true);
    const distance = this.getPopupValue('distance', true);
    const utilization = parseFloat(this.popup.querySelector('#popup-utilization').value);
    const medium = this.popup.querySelector('#popup-medium').value;
    const processingPower = this.popup.querySelector('#popup-processing-power').value;
    const cpuLoad = parseFloat(this.popup.querySelector('#popup-cpu-load').value);
    
    // Create temporary hop object for calculation
    const tempHop = {
      bandwidth: bandwidth,
      distance: distance * 1000, // Convert km to meters
      propagationSpeed: this.getMediumSpeed(medium),
      processingDelay: this.calculateProcessingDelay(processingPower, cpuLoad),
      queuingDelay: this.calculateQueuingDelay(utilization)
    };
    
    // Calculate delays
    const delays = DelayCalculator.calculateHopDelays(tempHop, 1500);
    
    // Update display
    this.popup.querySelector('#popup-transmission').textContent = NetworkFormatter.time(delays.transmission);
    this.popup.querySelector('#popup-propagation').textContent = NetworkFormatter.time(delays.propagation);
    this.popup.querySelector('#popup-processing').textContent = NetworkFormatter.time(delays.processing);
    this.popup.querySelector('#popup-queuing').textContent = NetworkFormatter.time(delays.queuing);
    this.popup.querySelector('#popup-total').textContent = NetworkFormatter.time(delays.total);
    
    // Update queue analysis
    this.updateQueueAnalysis(bandwidth, utilization);
  }
  
  /**
   * Update queue analysis display
   */
  updateQueueAnalysis(bandwidth, utilization) {
    // Calculate service rate
    const serviceRate = bandwidth / (1500 * 8); // packets per second
    this.popup.querySelector('#popup-service-rate').textContent = 
      `${Math.round(serviceRate).toLocaleString()} packets/sec`;
    
    // Update utilization display
    const utilizationEl = this.popup.querySelector('#popup-queue-utilization');
    utilizationEl.textContent = NetworkFormatter.percentage(utilization);
    
    // Set utilization color
    if (utilization < 0.5) {
      utilizationEl.className = 'utilization-good';
    } else if (utilization < 0.8) {
      utilizationEl.className = 'utilization-warning';
    } else {
      utilizationEl.className = 'utilization-critical';
    }
    
    // Update queue status
    const statusEl = this.popup.querySelector('#popup-queue-status');
    if (utilization >= 0.95) {
      statusEl.textContent = 'Unstable (Dropping)';
      statusEl.className = 'status-unstable';
    } else if (utilization >= 0.8) {
      statusEl.textContent = 'Congested';
      statusEl.className = 'status-congested';
    } else {
      statusEl.textContent = 'Stable';
      statusEl.className = 'status-stable';
    }
  }
  
  /**
   * Get propagation speed for medium
   */
  getMediumSpeed(medium) {
    const speeds = {
      'fiber': 2e8,
      'copper': 1.8e8,
      'wifi': 3e8,
      'satellite': 3e8
    };
    return speeds[medium] || 2e8;
  }
  
  /**
   * Calculate processing delay based on device properties
   */
  calculateProcessingDelay(processingPower, cpuLoad) {
    const baseTimes = {
      'high': 0.0001,
      'medium': 0.0005,
      'low': 0.001
    };
    
    const powerFactors = {
      'high': 1.0,
      'medium': 1.5,
      'low': 3.0
    };
    
    const baseTime = baseTimes[processingPower] || 0.0005;
    const powerFactor = powerFactors[processingPower] || 1.5;
    const loadFactor = 1 + cpuLoad * 2;
    
    return baseTime * 1000 * powerFactor * loadFactor; // Convert to ms
  }
  
  /**
   * Calculate queuing delay based on utilization
   */
  calculateQueuingDelay(utilization) {
    if (utilization >= 0.95) {
      return 50; // Cap at 50ms for unstable queue
    }
    
    // Using simplified M/M/1 queue formula
    const delay = (1 / Math.pow(1 - utilization, 3)) - 1;
    return Math.min(delay, 50); // Cap at 50ms
  }
  
  /**
   * Show popup for a specific link
   */
  show(region, hop, mouseX, mouseY) {
    this.currentRegion = region;
    this.currentHop = hop;
    
    // Update popup title
    const title = this.popup.querySelector('#popup-title');
    title.textContent = `Link: ${region.startNode} → ${region.endNode}`;
    
    // Set current values
    this.setPopupValues(hop);
    
    // Position popup
    this.positionPopup(mouseX, mouseY);
    
    // Show popup
    this.popup.style.display = 'block';
    
    // Update preview
    this.updatePreview();
  }
  
  /**
   * Set popup values from hop data
   */
  setPopupValues(hop) {
    // Bandwidth (log scale)
    const bandwidthInput = this.popup.querySelector('#popup-bandwidth');
    bandwidthInput.value = Math.log10(hop.link.bandwidth);
    
    // Distance (log scale)
    const distanceInput = this.popup.querySelector('#popup-distance');
    distanceInput.value = Math.log10(hop.link.distance);
    
    // Medium
    const mediumSelect = this.popup.querySelector('#popup-medium');
    mediumSelect.value = hop.link.medium;
    
    // Utilization
    const utilizationInput = this.popup.querySelector('#popup-utilization');
    utilizationInput.value = hop.link.utilization;
    
    // Processing power
    const powerSelect = this.popup.querySelector('#popup-processing-power');
    powerSelect.value = hop.device.processingPower;
    
    // CPU load
    const cpuLoadInput = this.popup.querySelector('#popup-cpu-load');
    cpuLoadInput.value = hop.device.currentLoad;
    
    // Update displays
    this.popup.querySelector('#popup-bandwidth-value').textContent = 
      NetworkFormatter.bandwidth(hop.link.bandwidth);
    this.popup.querySelector('#popup-distance-value').textContent = 
      NetworkFormatter.distance(hop.link.distance * 1000);
    this.popup.querySelector('#popup-utilization-value').textContent = 
      NetworkFormatter.percentage(hop.link.utilization);
    this.popup.querySelector('#popup-cpu-load-value').textContent = 
      NetworkFormatter.percentage(hop.device.currentLoad);
  }
  
  /**
   * Position popup near mouse cursor
   */
  positionPopup(mouseX, mouseY) {
    const popupWidth = 400;
    const popupHeight = 600;
    const padding = 20;
    
    let left = mouseX + padding;
    let top = mouseY - popupHeight / 2;
    
    // Keep popup on screen
    if (left + popupWidth > window.innerWidth - padding) {
      left = mouseX - popupWidth - padding;
    }
    
    if (top < padding) {
      top = padding;
    } else if (top + popupHeight > window.innerHeight - padding) {
      top = window.innerHeight - popupHeight - padding;
    }
    
    this.popup.style.left = `${left}px`;
    this.popup.style.top = `${top}px`;
  }
  
  /**
   * Apply changes from popup to hop
   */
  applyChanges() {
    if (!this.currentHop) return;
    
    // Update hop with new values
    this.currentHop.link.bandwidth = this.getPopupValue('bandwidth', true);
    this.currentHop.link.distance = this.getPopupValue('distance', true);
    this.currentHop.link.medium = this.popup.querySelector('#popup-medium').value;
    this.currentHop.link.utilization = parseFloat(this.popup.querySelector('#popup-utilization').value);
    this.currentHop.device.processingPower = this.popup.querySelector('#popup-processing-power').value;
    this.currentHop.device.currentLoad = parseFloat(this.popup.querySelector('#popup-cpu-load').value);
    
    // Trigger update callback
    if (this.onUpdate) {
      this.onUpdate(this.currentHop);
    }
    
    // Hide popup
    this.hide();
  }
  
  /**
   * Hide popup
   */
  hide() {
    this.popup.style.display = 'none';
    this.currentRegion = null;
    this.currentHop = null;
  }
  
  /**
   * Check if popup is visible
   */
  isVisible() {
    return this.popup.style.display !== 'none';
  }
  
  /**
   * Destroy popup and clean up
   */
  destroy() {
    if (this.popup && this.popup.parentNode) {
      this.popup.parentNode.removeChild(this.popup);
    }
    this.popup = null;
  }
}