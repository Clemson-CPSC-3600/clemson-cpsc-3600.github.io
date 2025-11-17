/**
 * Controls - Interactive parameter controls for each network hop
 */
export class HopControls {
  constructor(networkPath, onUpdate) {
    this.networkPath = networkPath;
    this.onUpdate = onUpdate;
    this.debounceTimers = new Map();
  }
  
  /**
   * Create controls HTML for a specific hop
   */
  createHopControls(hop, index) {
    const hopId = `hop-controls-${index}`;
    
    return `
      <details class="hop-control-group" data-hop-index="${index}">
        <summary class="hop-control-header">
          <span class="hop-icon">${this.getHopIcon(hop.type)}</span>
          <span class="hop-name">Hop ${index + 1}: ${hop.name}</span>
          <span class="hop-latency" id="hop-latency-${index}">-</span>
        </summary>
        
        <div class="hop-control-content">
          <!-- Link Parameters -->
          <div class="control-section">
            <h4>🔗 Link Parameters</h4>
            
            <div class="control-item">
              <label for="bandwidth-${index}">
                Bandwidth: <span id="bandwidth-value-${index}">${this.formatBandwidth(hop.link.bandwidth)}</span>
              </label>
              <input type="range" 
                     id="bandwidth-${index}" 
                     min="6" 
                     max="10.3" 
                     step="0.1"
                     value="${Math.log10(hop.link.bandwidth)}"
                     data-hop="${index}" 
                     data-category="link" 
                     data-param="bandwidth"
                     class="log-scale">
            </div>
            
            <div class="control-item">
              <label for="distance-${index}">
                Distance: <span id="distance-value-${index}">${this.formatDistance(hop.link.distance)}</span>
              </label>
              <input type="range" 
                     id="distance-${index}" 
                     min="-3" 
                     max="3.7" 
                     step="0.1"
                     value="${Math.log10(Math.max(0.001, hop.link.distance))}"
                     data-hop="${index}" 
                     data-category="link" 
                     data-param="distance"
                     class="log-scale">
            </div>
            
            <div class="control-item">
              <label for="medium-${index}">Link Medium:</label>
              <select id="medium-${index}" 
                      data-hop="${index}" 
                      data-category="link" 
                      data-param="medium">
                <option value="fiber" ${hop.link.medium === 'fiber' ? 'selected' : ''}>Fiber Optic</option>
                <option value="copper" ${hop.link.medium === 'copper' ? 'selected' : ''}>Copper/Ethernet</option>
                <option value="wifi" ${hop.link.medium === 'wifi' ? 'selected' : ''}>WiFi</option>
                <option value="satellite" ${hop.link.medium === 'satellite' ? 'selected' : ''}>Satellite</option>
              </select>
            </div>
            
            <div class="control-item">
              <label for="utilization-${index}">
                Link Utilization: <span id="utilization-value-${index}">${Math.round(hop.link.utilization * 100)}%</span>
              </label>
              <input type="range" 
                     id="utilization-${index}" 
                     min="0" 
                     max="0.95" 
                     step="0.05"
                     value="${hop.link.utilization}"
                     data-hop="${index}" 
                     data-category="link" 
                     data-param="utilization">
            </div>
          </div>
          
          <!-- Device Parameters -->
          <div class="control-section">
            <h4>🖥️ Device Parameters</h4>
            
            <div class="control-item">
              <label for="processing-power-${index}">Processing Power:</label>
              <select id="processing-power-${index}" 
                      data-hop="${index}" 
                      data-category="device" 
                      data-param="processingPower">
                <option value="low" ${hop.device.processingPower === 'low' ? 'selected' : ''}>Low (Home Router)</option>
                <option value="medium" ${hop.device.processingPower === 'medium' ? 'selected' : ''}>Medium (ISP Router)</option>
                <option value="high" ${hop.device.processingPower === 'high' ? 'selected' : ''}>High (Core Router)</option>
              </select>
            </div>
            
            <div class="control-item">
              <label for="cpu-load-${index}">
                CPU Load: <span id="cpu-load-value-${index}">${Math.round(hop.device.currentLoad * 100)}%</span>
              </label>
              <input type="range" 
                     id="cpu-load-${index}" 
                     min="0" 
                     max="1" 
                     step="0.05"
                     value="${hop.device.currentLoad}"
                     data-hop="${index}" 
                     data-category="device" 
                     data-param="currentLoad">
            </div>
          </div>
          
          <!-- Calculated Values -->
          <div class="control-section">
            <h4>📊 Calculated Values</h4>
            
            <div class="control-item">
              <label>Service Rate:</label>
              <div class="calculated-value">
                <span id="service-rate-value-${index}">${this.calculateServiceRate(hop)}</span> pkts/sec
                <small class="help-text">Bandwidth / packet size</small>
              </div>
            </div>
            
            <div class="control-item">
              <label>Queuing Delay:</label>
              <div class="calculated-value">
                <span id="queuing-delay-value-${index}">${hop.calculateQueuing().toFixed(2)}</span> ms
                <small class="help-text">(1/(1-x)³) - 1, where x = link utilization</small>
              </div>
            </div>
          </div>
        </div>
      </details>
    `;
  }
  
  /**
   * Create the complete hop controls panel
   */
  createHopControlsPanel() {
    const hopsHtml = this.networkPath.hops.map((hop, i) => 
      this.createHopControls(hop, i)
    ).join('');
    
    return `
      <div class="hop-controls-container">
        <div class="hop-controls-header">
          <h3>⚙️ Hop Configuration</h3>
          <button id="reset-hops-btn" class="secondary-btn">Reset to Default</button>
        </div>
        ${hopsHtml}
      </div>
    `;
  }
  
  /**
   * Bind event listeners to controls
   */
  bindEvents(container) {
    // Range inputs
    container.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', (e) => this.handleRangeInput(e));
    });
    
    // Select dropdowns
    container.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', (e) => this.handleSelectChange(e));
    });
    
    // Reset button
    const resetBtn = container.querySelector('#reset-hops-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleReset());
    }
  }
  
  /**
   * Handle range input changes with debouncing
   */
  handleRangeInput(event) {
    const input = event.target;
    const hopIndex = parseInt(input.dataset.hop);
    const category = input.dataset.category;
    const param = input.dataset.param;
    let value = parseFloat(input.value);
    
    // Handle log scale conversions
    if (input.classList.contains('log-scale')) {
      value = Math.pow(10, value);
    }
    
    // Update display immediately
    this.updateRangeDisplay(input, hopIndex, category, param, value);
    
    // Debounce the actual update
    this.debounceUpdate(hopIndex, category, param, value);
  }
  
  /**
   * Handle select dropdown changes
   */
  handleSelectChange(event) {
    const select = event.target;
    const hopIndex = parseInt(select.dataset.hop);
    const category = select.dataset.category;
    const param = select.dataset.param;
    const value = select.value;
    
    // Update immediately for discrete values
    this.networkPath.updateHop(hopIndex, category, param, value);
    
    // Special handling for satellite medium
    if (param === 'medium' && value === 'satellite') {
      // Adjust bandwidth for satellite
      const bandwidthInput = document.getElementById(`bandwidth-${hopIndex}`);
      if (bandwidthInput) {
        bandwidthInput.value = Math.log10(25_000_000); // 25 Mbps typical
        this.handleRangeInput({ target: bandwidthInput });
      }
    }
    
    this.onUpdate();
  }
  
  /**
   * Update range display values
   */
  updateRangeDisplay(input, hopIndex, category, param, value) {
    let displayValue = value;
    let displayElement = null;
    
    switch(param) {
      case 'bandwidth':
        displayElement = document.getElementById(`bandwidth-value-${hopIndex}`);
        if (displayElement) {
          displayElement.textContent = this.formatBandwidth(value);
        }
        // Bandwidth affects service rate and queuing delay, so update them
        this.updateServiceRateDisplay(hopIndex);
        this.updateQueuingDelayDisplay(hopIndex);
        break;
        
      case 'distance':
        displayElement = document.getElementById(`distance-value-${hopIndex}`);
        if (displayElement) {
          displayElement.textContent = this.formatDistance(value);
        }
        break;
        
      case 'utilization':
        displayElement = document.getElementById(`utilization-value-${hopIndex}`);
        if (displayElement) {
          displayElement.textContent = `${Math.round(value * 100)}%`;
        }
        // Update service rate and queuing delay when link utilization changes
        this.updateServiceRateDisplay(hopIndex);
        this.updateQueuingDelayDisplay(hopIndex);
        break;
        
      case 'currentLoad':
        displayElement = document.getElementById(`cpu-load-value-${hopIndex}`);
        if (displayElement) {
          displayElement.textContent = `${Math.round(value * 100)}%`;
        }
        break;
        
      case 'arrivalRate':
        displayElement = document.getElementById(`arrival-rate-value-${hopIndex}`);
        if (displayElement) {
          displayElement.textContent = Math.round(value);
        }
        // Arrival rate no longer used - removed
        break;
    }
  }
  
  /**
   * Calculate service rate from bandwidth and packet size
   */
  calculateServiceRate(hop) {
    const packetSize = parseInt(document.getElementById('packet-size')?.value || 1500);
    const packetSizeBits = packetSize * 8;
    const serviceRate = hop.link.bandwidth / packetSizeBits;
    return serviceRate.toFixed(0);
  }
  
  /**
   * Update queuing delay display when parameters change
   */
  updateQueuingDelayDisplay(hopIndex) {
    const hop = this.networkPath.hops[hopIndex];
    const delayElement = document.getElementById(`queuing-delay-value-${hopIndex}`);
    if (delayElement) {
      const delay = hop.calculateQueuing();
      delayElement.textContent = delay.toFixed(2);
      
      // Color based on delay
      if (delay > 10) {
        delayElement.style.color = '#e74c3c';
      } else if (delay > 5) {
        delayElement.style.color = '#f39c12';
      } else {
        delayElement.style.color = '#2ecc71';
      }
    }
  }
  
  /**
   * Debounce parameter updates for performance
   */
  debounceUpdate(hopIndex, category, param, value) {
    const key = `${hopIndex}-${category}-${param}`;
    
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.networkPath.updateHop(hopIndex, category, param, value);
      this.onUpdate();
      this.debounceTimers.delete(key);
    }, 100);
    
    this.debounceTimers.set(key, timer);
  }
  
  /**
   * Reset all hops to default
   */
  handleReset() {
    const presetSelect = document.getElementById('preset-select');
    const preset = presetSelect ? presetSelect.value : 'default';
    this.networkPath.loadPreset(preset);
    this.onUpdate();
    this.refreshControls();
  }
  
  /**
   * Refresh all control displays
   */
  refreshControls() {
    // This would need to rebuild the controls
    // For now, just reload the page
    location.reload();
  }
  
  /**
   * Update hop latency displays
   */
  updateLatencyDisplays(latencyData) {
    if (!latencyData || !latencyData.breakdown) return;
    
    latencyData.breakdown.forEach((hop, index) => {
      const latencyElement = document.getElementById(`hop-latency-${index}`);
      if (latencyElement) {
        latencyElement.textContent = `${hop.latencies.total.toFixed(1)}ms`;
        
        // Color based on latency
        if (hop.latencies.total > 50) {
          latencyElement.style.color = '#e74c3c';
        } else if (hop.latencies.total > 20) {
          latencyElement.style.color = '#f39c12';
        } else {
          latencyElement.style.color = '#2ecc71';
        }
      }
    });
  }
  
  /**
   * Format bandwidth for display
   */
  formatBandwidth(bps) {
    if (bps >= 1_000_000_000) {
      return `${(bps / 1_000_000_000).toFixed(1)} Gbps`;
    } else if (bps >= 1_000_000) {
      return `${(bps / 1_000_000).toFixed(0)} Mbps`;
    } else if (bps >= 1_000) {
      return `${(bps / 1_000).toFixed(0)} Kbps`;
    } else {
      return `${bps} bps`;
    }
  }
  
  /**
   * Format distance for display
   */
  formatDistance(km) {
    if (km < 0.001) {
      return `${(km * 1_000_000).toFixed(0)} mm`;
    } else if (km < 1) {
      return `${(km * 1_000).toFixed(0)} m`;
    } else {
      return `${km.toFixed(0)} km`;
    }
  }
  
  /**
   * Update service rate display when bandwidth or packet size changes
   */
  updateServiceRateDisplay(hopIndex) {
    const hop = this.networkPath.hops[hopIndex];
    const serviceRateElement = document.getElementById(`service-rate-value-${hopIndex}`);
    if (serviceRateElement) {
      serviceRateElement.textContent = this.calculateServiceRate(hop);
    }
  }
  
  /**
   * Update all control displays for a hop
   */
  updateControlDisplays(hopIndex) {
    const hop = this.networkPath.hops[hopIndex];
    
    // Update bandwidth display
    const bandwidthInput = document.getElementById(`bandwidth-${hopIndex}`);
    const bandwidthDisplay = document.getElementById(`bandwidth-value-${hopIndex}`);
    if (bandwidthInput && bandwidthDisplay) {
      bandwidthInput.value = Math.log10(hop.link.bandwidth);
      bandwidthDisplay.textContent = this.formatBandwidth(hop.link.bandwidth);
    }
    
    // Update distance display
    const distanceInput = document.getElementById(`distance-${hopIndex}`);
    const distanceDisplay = document.getElementById(`distance-value-${hopIndex}`);
    if (distanceInput && distanceDisplay) {
      distanceInput.value = Math.log10(Math.max(0.001, hop.link.distance));
      distanceDisplay.textContent = this.formatDistance(hop.link.distance);
    }
    
    // Update medium selector
    const mediumSelect = document.getElementById(`medium-${hopIndex}`);
    if (mediumSelect) {
      mediumSelect.value = hop.link.medium;
    }
    
    // Update utilization display
    const utilizationInput = document.getElementById(`utilization-${hopIndex}`);
    const utilizationDisplay = document.getElementById(`utilization-value-${hopIndex}`);
    if (utilizationInput && utilizationDisplay) {
      utilizationInput.value = hop.link.utilization;
      utilizationDisplay.textContent = `${Math.round(hop.link.utilization * 100)}%`;
    }
    
    // Update processing power selector
    const processingSelect = document.getElementById(`processing-power-${hopIndex}`);
    if (processingSelect) {
      processingSelect.value = hop.device.processingPower;
    }
    
    // Update CPU load display
    const cpuLoadInput = document.getElementById(`cpu-load-${hopIndex}`);
    const cpuLoadDisplay = document.getElementById(`cpu-load-value-${hopIndex}`);
    if (cpuLoadInput && cpuLoadDisplay) {
      cpuLoadInput.value = hop.device.currentLoad;
      cpuLoadDisplay.textContent = `${Math.round(hop.device.currentLoad * 100)}%`;
    }
    
    // Update calculated values
    this.updateServiceRateDisplay(hopIndex);
    this.updateQueuingDelayDisplay(hopIndex);
  }
  
  /**
   * Get icon for hop type
   */
  getHopIcon(type) {
    const icons = {
      'client': '💻',
      'router': '🔄',
      'isp-edge': '🌐',
      'core': '⚡',
      'server': '🖥️'
    };
    return icons[type] || '📡';
  }
}