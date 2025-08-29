/**
 * PacketJourneyVisualization - Renders the network path and latency information
 */
export class PacketJourneyVisualization {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas with id '${canvasId}' not found`);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    
    // Visual configuration
    this.nodeRadius = 30;
    this.nodeSpacing = 150;
    this.colors = {
      excellent: '#2ecc71',  // < 30ms
      good: '#3498db',       // 30-60ms
      okay: '#f39c12',       // 60-100ms
      poor: '#e67e22',       // 100-200ms
      bad: '#e74c3c'         // > 200ms
    };
    
    // Device icons (using emoji for simplicity)
    this.deviceIcons = {
      'client': '💻',
      'router': '🔄',
      'isp-edge': '🌐',
      'core': '⚡',
      'server': '🖥️'
    };
    
    // Store link positions for click detection
    this.linkRegions = [];
    
    // Store node positions for hover detection
    this.nodeRegions = [];
    
    // Store references for popup
    this.currentPath = null;
    this.currentLatencyData = null;
    
    // Create popup element
    this.createPopup();
    
    // Create tooltip element
    this.createTooltip();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  setupCanvas() {
    // Handle high DPI displays
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Use parent container width and fixed height
    const container = this.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const width = Math.floor(containerRect.width - 48); // Account for padding
    const height = 500; // Fixed height to prevent scaling
    
    // Set canvas actual size scaled for device pixel ratio
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    
    // Set CSS size to match logical pixels exactly
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    
    // Scale the drawing context to match device pixel ratio
    this.ctx.scale(dpr, dpr);
    
    // Enable better text rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Store dimensions for drawing calculations
    this.width = width;
    this.height = height;
    this.dpr = dpr;
  }
  
  /**
   * Create the popup element for link details
   */
  createPopup() {
    this.popup = document.createElement('div');
    this.popup.className = 'link-popup';
    this.popup.style.display = 'none';
    document.body.appendChild(this.popup);
  }
  
  /**
   * Create the tooltip element for hover information
   */
  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'canvas-tooltip';
    this.tooltip.style.display = 'none';
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.pointerEvents = 'none';
    this.tooltip.style.zIndex = '1000';
    document.body.appendChild(this.tooltip);
  }
  
  /**
   * Set up event listeners for interaction
   */
  setupEventListeners() {
    // Click handler for links
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if click is on a link
      for (const region of this.linkRegions) {
        if (this.isPointInLink(x, y, region)) {
          this.showLinkPopup(region, e.clientX, e.clientY);
          return;
        }
      }
      
      // Hide popup if clicked elsewhere
      this.hidePopup();
    });
    
    // Change cursor and show tooltips on hover
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if hovering over a node
      let overNode = false;
      let nodeData = null;
      for (const region of this.nodeRegions) {
        if (this.isPointInNode(x, y, region)) {
          overNode = true;
          nodeData = region;
          this.showNodeTooltip(region, e.clientX, e.clientY);
          break;
        }
      }
      
      if (!overNode) {
        // Check if hovering over a link (just for cursor, no tooltip)
        let overLink = false;
        for (const region of this.linkRegions) {
          if (this.isPointInLink(x, y, region)) {
            overLink = true;
            break;
          }
        }
        
        if (!overLink) {
          // Check if hovering over legend
          let overLegend = false;
          if (this.legendRegions) {
            for (const region of this.legendRegions) {
              if (x >= region.x && x <= region.x + region.width &&
                  y >= region.y && y <= region.y + region.height) {
                overLegend = true;
                this.showLegendTooltip(region, e.clientX, e.clientY);
                break;
              }
            }
          }
          
          if (!overLegend) {
            this.hideTooltip();
          }
          this.canvas.style.cursor = overLegend ? 'help' : 'default';
        } else {
          this.canvas.style.cursor = 'pointer';
        }
      } else {
        this.canvas.style.cursor = 'help';
      }
    });
    
    // Hide tooltip when mouse leaves canvas
    this.canvas.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });
    
    // Hide popup when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target !== this.canvas && !this.popup.contains(e.target)) {
        this.hidePopup();
      }
    });
  }
  
  /**
   * Bind events to popup controls
   */
  bindPopupEvents() {
    // Handle close button
    this.popup.querySelectorAll('[data-action="close"]').forEach(btn => {
      btn.addEventListener('click', () => this.hidePopup());
    });
    
    // Handle apply button
    const applyBtn = this.popup.querySelector('[data-action="apply"]');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyPopupChanges());
    }
    
    // Handle range inputs for live preview
    this.popup.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', (e) => this.handlePopupRangeInput(e));
    });
    
    // Handle select changes for live preview
    this.popup.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', (e) => {
        // Special handling for satellite medium
        if (e.target.id === 'popup-medium' && e.target.value === 'satellite') {
          // Adjust bandwidth for satellite (typically lower)
          const bandwidthInput = document.getElementById('popup-bandwidth');
          if (bandwidthInput) {
            bandwidthInput.value = Math.log10(25_000_000); // 25 Mbps typical for satellite
            this.handlePopupRangeInput({ target: bandwidthInput });
          }
        }
        this.updateLatencyPreview();
      });
    });
  }
  
  /**
   * Handle range input changes in popup
   */
  handlePopupRangeInput(event) {
    const input = event.target;
    const param = input.dataset.param;
    let value = parseFloat(input.value);
    
    // Handle log scale conversions
    if (input.classList.contains('log-scale')) {
      value = Math.pow(10, value);
    }
    
    // Update display value
    switch(param) {
      case 'bandwidth':
        const bandwidthDisplay = document.getElementById('popup-bandwidth-value');
        if (bandwidthDisplay) bandwidthDisplay.textContent = this.formatBandwidth(value);
        // Update service rate since it depends on bandwidth
        this.updateServiceRateDisplayInPopup();
        this.updateQueueUtilizationDisplay();
        break;
      case 'distance':
        const distanceDisplay = document.getElementById('popup-distance-value');
        if (distanceDisplay) distanceDisplay.textContent = this.formatDistance(value);
        break;
      case 'utilization':
        const utilizationDisplay = document.getElementById('popup-utilization-value');
        if (utilizationDisplay) utilizationDisplay.textContent = `${Math.round(value * 100)}%`;
        // Link utilization affects effective bandwidth and thus transmission delay
        this.updateLatencyPreview();
        break;
      case 'currentLoad':
        const loadDisplay = document.getElementById('popup-cpu-load-value');
        if (loadDisplay) loadDisplay.textContent = `${Math.round(value * 100)}%`;
        break;
    }
    
    // Update latency preview
    this.updateLatencyPreview();
  }
  
  /**
   * Update service rate display in popup
   */
  updateServiceRateDisplayInPopup() {
    if (this.currentHopIndex === undefined || !this.currentPath) return;
    
    const packetSize = parseInt(document.getElementById('packet-size')?.value || 1500);
    const bandwidth = this.getPopupValue('bandwidth', true);
    const packetSizeBits = packetSize * 8;
    const serviceRate = bandwidth / packetSizeBits;
    
    const serviceDisplay = document.getElementById('popup-service-rate-display');
    if (serviceDisplay) {
      serviceDisplay.textContent = serviceRate.toFixed(0);
    }
  }
  
  /**
   * Update queue utilization display in popup
   */
  updateQueueUtilizationDisplay() {
    if (this.currentHopIndex === undefined || !this.currentPath) return;
    
    const packetSize = parseInt(document.getElementById('packet-size')?.value || 1500);
    const arrivalRate = parseFloat(document.getElementById('popup-arrival')?.value || 0);
    const bandwidth = this.getPopupValue('bandwidth', true);
    const packetSizeBits = packetSize * 8;
    const serviceRate = bandwidth / packetSizeBits;
    const utilization = arrivalRate / serviceRate;
    
    const fillElement = document.getElementById('popup-queue-util');
    const percentElement = this.popup.querySelector('.popup-queue-percent');
    
    if (fillElement) {
      fillElement.style.width = `${utilization * 100}%`;
      // Color based on utilization
      if (utilization > 0.8) {
        fillElement.style.background = '#e74c3c';
      } else if (utilization > 0.6) {
        fillElement.style.background = '#f39c12';
      } else {
        fillElement.style.background = '#2ecc71';
      }
    }
    
    if (percentElement) {
      percentElement.textContent = `${(utilization * 100).toFixed(1)}%`;
    }
  }
  
  /**
   * Update latency preview based on current popup values
   */
  updateLatencyPreview() {
    if (this.currentHopIndex === undefined || !this.currentPath) return;
    
    const hop = this.currentPath.hops[this.currentHopIndex];
    const packetSize = parseInt(document.getElementById('packet-size')?.value || 1500);
    
    // Create temporary hop with popup values
    const tempHop = {
      link: {
        bandwidth: this.getPopupValue('bandwidth', true),
        distance: this.getPopupValue('distance', true),
        medium: document.getElementById('popup-medium')?.value || hop.link.medium,
        utilization: this.getPopupValue('utilization', false)
      },
      device: {
        processingPower: document.getElementById('popup-processing-power')?.value || hop.device.processingPower,
        processingTimeBase: hop.device.processingTimeBase,
        currentLoad: this.getPopupValue('currentLoad', false)
      }
    };
    
    // Calculate latencies with temporary values
    const latencies = {
      transmission: this.calculateTransmission(packetSize, tempHop),
      propagation: this.calculatePropagation(tempHop),
      processing: this.calculateProcessing(tempHop),
      queuing: this.calculateQueuing(tempHop)
    };
    latencies.total = latencies.transmission + latencies.propagation + latencies.processing + latencies.queuing;
    
    // Update preview displays
    const updates = [
      { id: 'popup-trans-preview', value: latencies.transmission },
      { id: 'popup-prop-preview', value: latencies.propagation },
      { id: 'popup-proc-preview', value: latencies.processing },
      { id: 'popup-queue-preview', value: latencies.queuing },
      { id: 'popup-total-preview', value: latencies.total }
    ];
    
    updates.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = `${value.toFixed(2)}ms`;
        // Color code total based on value
        if (id === 'popup-total-preview') {
          element.style.color = this.getLatencyColor(value);
        }
      }
    });
  }
  
  /**
   * Get value from popup input
   */
  getPopupValue(param, isLogScale) {
    const input = this.popup.querySelector(`[data-param="${param}"]`);
    if (!input) return 0;
    
    let value = parseFloat(input.value);
    if (isLogScale && input.classList.contains('log-scale')) {
      value = Math.pow(10, value);
    }
    return value;
  }
  
  /**
   * Calculate individual latency components (copied from NetworkHop for preview)
   */
  calculateTransmission(packetSizeBytes, hop) {
    const bits = packetSizeBytes * 8;
    const effectiveBandwidth = hop.link.bandwidth * (1 - hop.link.utilization);
    if (effectiveBandwidth <= 0) return 1000;
    return (bits / effectiveBandwidth) * 1000;
  }
  
  calculatePropagation(hop) {
    const signalSpeed = {
      'fiber': 200_000,
      'copper': 180_000,
      'wifi': 300_000,
      'satellite': 300_000
    };
    
    let distance = hop.link.distance;
    if (hop.link.medium === 'satellite') {
      distance += 35_786 * 2;
    }
    
    const speed = signalSpeed[hop.link.medium] || signalSpeed['copper'];
    return (distance / speed) * 1000;
  }
  
  calculateProcessing(hop) {
    const powerMultiplier = {
      'low': 3.0,
      'medium': 1.5,
      'high': 1.0
    };
    
    const loadFactor = 1 + (hop.device.currentLoad * 2);
    const processingTime = hop.device.processingTimeBase * 
                          powerMultiplier[hop.device.processingPower] * 
                          loadFactor;
    return processingTime * 1000;
  }
  
  calculateQueuing(hop) {
    // Use link utilization directly
    const utilization = hop.link.utilization;
    if (utilization >= 0.95) return 100;
    if (utilization < 0.05) return 0.1;
    return (1 / Math.pow(1 - utilization, 3)) - 1;
  }
  
  /**
   * Apply changes from popup to the actual network path
   */
  applyPopupChanges() {
    if (this.currentHopIndex === undefined || !this.currentPath) {
      console.log('No current hop or path');
      return;
    }
    
    const hop = this.currentPath.hops[this.currentHopIndex];
    console.log('Applying changes to hop:', this.currentHopIndex, hop.name);
    
    // Update link parameters
    hop.link.bandwidth = this.getPopupValue('bandwidth', true);
    hop.link.distance = this.getPopupValue('distance', true);
    hop.link.medium = document.getElementById('popup-medium')?.value || hop.link.medium;
    hop.link.utilization = this.getPopupValue('utilization', false);
    
    // Update device parameters
    hop.device.processingPower = document.getElementById('popup-processing-power')?.value || hop.device.processingPower;
    hop.device.currentLoad = this.getPopupValue('currentLoad', false);
    
    console.log('Updated hop parameters:', hop);
    
    // Trigger recalculation and re-render
    if (window.calculateAndDisplay) {
      console.log('Triggering recalculation');
      window.calculateAndDisplay();
    } else {
      console.error('calculateAndDisplay not found on window');
    }
    
    // Close popup
    this.hidePopup();
  }
  
  /**
   * Check if a point is within a link's clickable region
   */
  isPointInLink(x, y, region) {
    // Create a rectangle around the link line with some padding
    const padding = 15;
    const minX = Math.min(region.x1, region.x2) - padding;
    const maxX = Math.max(region.x1, region.x2) + padding;
    const minY = region.y - padding;
    const maxY = region.y + padding;
    
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }
  
  /**
   * Calculate service rate from bandwidth and packet size
   */
  calculateServiceRate(hop, packetSizeBytes) {
    const packetSizeBits = packetSizeBytes * 8;
    return hop.link.bandwidth / packetSizeBits; // packets per second
  }
  
  /**
   * Calculate queue utilization
   */
  calculateQueueUtilization(hop, packetSizeBytes) {
    // Queue utilization is now directly the link utilization
    return hop.link.utilization;
  }
  
  /**
   * Show popup with link details
   */
  showLinkPopup(region, mouseX, mouseY) {
    const hop = region.hop;
    const hopIndex = region.hopIndex;
    const latencyData = region.latencyData;
    
    // Store current hop for updates
    this.currentHopIndex = hopIndex;
    
    // Calculate latencies for current packet size
    const packetSize = parseInt(document.getElementById('packet-size')?.value || 1500);
    const latencies = hop.calculateLatencies(packetSize);
    
    // Generate popup content with editable controls
    const popupContent = `
      <div class="popup-header">
        <h4>📡 Link ${hopIndex + 1}: ${hop.name}</h4>
        <button class="popup-close" data-action="close">×</button>
      </div>
      
      <div class="popup-section">
        <h5>🔗 Link Properties</h5>
        
        <div class="popup-control">
          <label>Medium:</label>
          <select id="popup-medium" data-param="medium" data-category="link">
            <option value="fiber" ${hop.link.medium === 'fiber' ? 'selected' : ''}>Fiber Optic</option>
            <option value="copper" ${hop.link.medium === 'copper' ? 'selected' : ''}>Copper/Ethernet</option>
            <option value="wifi" ${hop.link.medium === 'wifi' ? 'selected' : ''}>WiFi</option>
            <option value="satellite" ${hop.link.medium === 'satellite' ? 'selected' : ''}>Satellite</option>
          </select>
        </div>
        
        <div class="popup-control">
          <label>Bandwidth: <span id="popup-bandwidth-value">${this.formatBandwidth(hop.link.bandwidth)}</span></label>
          <input type="range" 
                 id="popup-bandwidth" 
                 min="6" max="10.3" step="0.1"
                 value="${Math.log10(hop.link.bandwidth)}"
                 data-param="bandwidth" 
                 data-category="link"
                 class="popup-slider log-scale">
        </div>
        
        <div class="popup-control">
          <label>Distance: <span id="popup-distance-value">${this.formatDistance(hop.link.distance)}</span></label>
          <input type="range" 
                 id="popup-distance" 
                 min="-3" max="3.7" step="0.1"
                 value="${Math.log10(Math.max(0.001, hop.link.distance))}"
                 data-param="distance" 
                 data-category="link"
                 class="popup-slider log-scale">
        </div>
        
        <div class="popup-control">
          <label>Link Utilization: <span id="popup-utilization-value">${Math.round(hop.link.utilization * 100)}%</span></label>
          <input type="range" 
                 id="popup-utilization" 
                 min="0" max="0.95" step="0.05"
                 value="${hop.link.utilization}"
                 data-param="utilization" 
                 data-category="link"
                 class="popup-slider">
        </div>
      </div>
      
      <div class="popup-section">
        <h5>🖥️ Device Properties</h5>
        
        <div class="popup-control">
          <label>Processing Power:</label>
          <select id="popup-processing-power" data-param="processingPower" data-category="device">
            <option value="low" ${hop.device.processingPower === 'low' ? 'selected' : ''}>Low (Home Router)</option>
            <option value="medium" ${hop.device.processingPower === 'medium' ? 'selected' : ''}>Medium (ISP Router)</option>
            <option value="high" ${hop.device.processingPower === 'high' ? 'selected' : ''}>High (Core Router)</option>
          </select>
        </div>
        
        <div class="popup-control">
          <label>CPU Load: <span id="popup-cpu-load-value">${Math.round(hop.device.currentLoad * 100)}%</span></label>
          <input type="range" 
                 id="popup-cpu-load" 
                 min="0" max="1" step="0.05"
                 value="${hop.device.currentLoad}"
                 data-param="currentLoad" 
                 data-category="device"
                 class="popup-slider">
        </div>
      </div>
      
      <div class="popup-section popup-latency-preview">
        <h5>⏱️ Latency Impact (Live Preview)</h5>
        <div class="popup-item">
          <span class="popup-label">Transmission:</span>
          <span class="popup-value" id="popup-trans-preview" style="color: #3498db">${latencies.transmission.toFixed(2)}ms</span>
        </div>
        <div class="popup-item">
          <span class="popup-label">Propagation:</span>
          <span class="popup-value" id="popup-prop-preview" style="color: #2ecc71">${latencies.propagation.toFixed(2)}ms</span>
        </div>
        <div class="popup-item">
          <span class="popup-label">Processing:</span>
          <span class="popup-value" id="popup-proc-preview" style="color: #f39c12">${latencies.processing.toFixed(2)}ms</span>
        </div>
        <div class="popup-item">
          <span class="popup-label">Queuing:</span>
          <span class="popup-value" id="popup-queue-preview" style="color: #e74c3c">${latencies.queuing.toFixed(2)}ms</span>
        </div>
        <div class="popup-item popup-total">
          <span class="popup-label">Total:</span>
          <span class="popup-value" id="popup-total-preview">${latencies.total.toFixed(2)}ms</span>
        </div>
      </div>
      
      <div class="popup-footer">
        <button class="popup-btn popup-btn-primary" data-action="apply">Apply Changes</button>
        <button class="popup-btn popup-btn-secondary" data-action="close">Cancel</button>
      </div>
    `;
    
    this.popup.innerHTML = popupContent;
    
    // Bind events to popup controls
    this.bindPopupEvents();
    
    // Position the popup
    this.popup.style.display = 'block';
    const popupRect = this.popup.getBoundingClientRect();
    
    // Calculate optimal position
    let left = mouseX + 10;
    let top = mouseY - (popupRect.height / 2); // Center vertically on click point
    
    // Ensure popup stays within viewport
    if (left + popupRect.width > window.innerWidth - 10) {
      left = mouseX - popupRect.width - 10;
    }
    if (left < 10) {
      left = 10;
    }
    
    // Keep popup on screen vertically
    if (top < 10) {
      top = 10;
    }
    if (top + popupRect.height > window.innerHeight - 10) {
      top = window.innerHeight - popupRect.height - 10;
    }
    
    // If popup is still too tall, make it scrollable
    if (popupRect.height > window.innerHeight - 20) {
      top = 10;
      this.popup.style.maxHeight = (window.innerHeight - 20) + 'px';
      this.popup.style.overflowY = 'auto';
    }
    
    this.popup.style.left = left + 'px';
    this.popup.style.top = top + 'px';
  }
  
  /**
   * Hide the popup
   */
  hidePopup() {
    if (this.popup) {
      this.popup.style.display = 'none';
    }
  }
  
  /**
   * Check if a point is within a node region
   */
  isPointInNode(x, y, region) {
    const dx = x - region.x;
    const dy = y - region.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.nodeRadius;
  }
  
  /**
   * Show tooltip for a node
   */
  showNodeTooltip(region, mouseX, mouseY) {
    const hop = region.hop;
    const isBottleneck = region.isBottleneck;
    
    let content = '';
    
    if (isBottleneck) {
      // Bottleneck warning tooltip
      const latency = region.latency;
      let bottleneckReason = '';
      
      if (latency.queuing > latency.transmission + latency.propagation + latency.processing) {
        bottleneckReason = `High queuing delay (${latency.queuing.toFixed(1)}ms) due to ${(hop.link.utilization * 100).toFixed(0)}% link utilization`;
      } else if (latency.transmission > 10) {
        bottleneckReason = `Slow transmission (${latency.transmission.toFixed(1)}ms) - bandwidth is only ${(hop.link.bandwidth / 1_000_000).toFixed(0)} Mbps`;
      } else if (latency.processing > 5) {
        bottleneckReason = `High processing delay (${latency.processing.toFixed(1)}ms) - device is at ${(hop.device.currentLoad * 100).toFixed(0)}% CPU load`;
      } else {
        bottleneckReason = `Total latency of ${latency.total.toFixed(1)}ms is highest in the path`;
      }
      
      content = `
        <div class="tooltip-header bottleneck">⚠️ Bottleneck Detected</div>
        <div class="tooltip-body">
          <p><strong>${hop.name}</strong></p>
          <p>${bottleneckReason}</p>
          <p class="tooltip-suggestion">💡 Consider: ${
            latency.queuing > 10 ? 'Upgrading bandwidth or reducing network load' :
            latency.transmission > 10 ? 'Upgrading to a faster connection' :
            'Upgrading device or reducing CPU load'
          }</p>
        </div>
      `;
    } else {
      // Regular node tooltip
      const deviceInfo = this.getDeviceInfo(hop.type);
      
      content = `
        <div class="tooltip-header">${this.deviceIcons[hop.type] || '📡'} ${hop.name}</div>
        <div class="tooltip-body">
          <p><strong>${deviceInfo.title}</strong></p>
          <p>${deviceInfo.description}</p>
          <div class="tooltip-stats">
            <div>🔧 ${hop.device.processingPower} power</div>
            <div>💻 ${(hop.device.currentLoad * 100).toFixed(0)}% CPU</div>
            <div>🔗 ${(hop.link.bandwidth / 1_000_000).toFixed(0)} Mbps</div>
          </div>
        </div>
      `;
    }
    
    this.tooltip.innerHTML = content;
    this.tooltip.style.display = 'block';
    
    // Position tooltip near mouse but keep on screen
    const tooltipRect = this.tooltip.getBoundingClientRect();
    let left = mouseX + 10;
    let top = mouseY - tooltipRect.height - 10;
    
    if (left + tooltipRect.width > window.innerWidth) {
      left = mouseX - tooltipRect.width - 10;
    }
    if (top < 0) {
      top = mouseY + 10;
    }
    
    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';
  }
  
  /**
   * Get device information for tooltips
   */
  getDeviceInfo(type) {
    const info = {
      'client': {
        title: 'Client Device',
        description: 'Your computer or device. Starting point of the network journey.'
      },
      'router': {
        title: 'Local Router',
        description: 'Routes packets within local networks. Moderate processing power.'
      },
      'isp-edge': {
        title: 'ISP Edge Router',
        description: 'Connects your home network to the internet backbone. Gateway to the wider internet.'
      },
      'core': {
        title: 'Core Router',
        description: 'High-capacity backbone router. Handles massive traffic between regions.'
      },
      'server': {
        title: 'Destination Server',
        description: 'The target server hosting the service or website you\'re accessing.'
      }
    };
    
    return info[type] || { title: 'Network Device', description: 'Routes packets through the network.' };
  }
  
  /**
   * Show tooltip for legend item
   */
  showLegendTooltip(region, mouseX, mouseY) {
    const item = region.item;
    
    // Educational content for each latency component
    const explanations = {
      'Transmission': {
        formula: 'packet_size / bandwidth',
        example: '1500 bytes / 100 Mbps = 0.12ms',
        factors: ['Link bandwidth', 'Packet size'],
        description: 'The time it takes to push all the bits of a packet onto the transmission medium. Depends on how fast the network card can serialize bits.'
      },
      'Propagation': {
        formula: 'distance / signal_speed',
        example: '1000 km / 200,000 km/s = 5ms',
        factors: ['Physical distance', 'Medium type (fiber/copper/air)'],
        description: 'The time for the signal to physically travel from sender to receiver. Limited by the speed of light in the medium.'
      },
      'Processing': {
        formula: 'varies by device',
        example: 'Home router: 1-3ms, Core router: 0.1-0.5ms',
        factors: ['Device CPU power', 'Current load', 'Routing complexity'],
        description: 'Time to examine headers, make routing decisions, and forward the packet. Modern core routers use specialized hardware.'
      },
      'Queuing': {
        formula: '(1/(1-ρ)³) - 1 where ρ = utilization',
        example: '50% util = 7ms, 80% util = 125ms',
        factors: ['Link utilization', 'Traffic patterns', 'Buffer size'],
        description: 'Time spent waiting in queue before transmission. Increases exponentially as utilization approaches 100%.'
      }
    };
    
    const exp = explanations[item.name];
    
    const content = `
      <div class="tooltip-header">${item.name} Delay</div>
      <div class="tooltip-body">
        <p>${exp.description}</p>
        <p><strong>Formula:</strong> <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px; color: #e83e8c;">${exp.formula}</code></p>
        <p><strong>Example:</strong> ${exp.example}</p>
        <p><strong>Key Factors:</strong></p>
        <ul style="margin: 5px 0 0 20px; padding: 0; font-size: 12px;">
          ${exp.factors.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    `;
    
    // Display the tooltip
    this.tooltip.innerHTML = content;
    this.tooltip.style.display = 'block';
    
    // Position tooltip near mouse but keep on screen
    const tooltipRect = this.tooltip.getBoundingClientRect();
    let left = mouseX + 10;
    let top = mouseY - tooltipRect.height - 10;
    
    // Keep tooltip on screen
    if (left + tooltipRect.width > window.innerWidth) {
      left = mouseX - tooltipRect.width - 10;
    }
    if (top < 0) {
      top = mouseY + 10;
    }
    
    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';
  }
  
  /**
   * Hide the tooltip
   */
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }
  
  /**
   * Format bandwidth for display
   */
  formatBandwidth(bps) {
    if (bps >= 1_000_000_000) {
      return `${(bps / 1_000_000_000).toFixed(1)} Gbps`;
    } else if (bps >= 1_000_000) {
      return `${(bps / 1_000_000).toFixed(0)} Mbps`;
    } else {
      return `${(bps / 1_000).toFixed(0)} Kbps`;
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
   * Clear the canvas
   */
  clear() {
    // Clear using the actual display dimensions, not the scaled dimensions
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  /**
   * Render the complete network path with latency information
   */
  renderPath(path, latencyData = null) {
    this.clear();
    
    // Store references for popup use
    this.currentPath = path;
    this.currentLatencyData = latencyData;
    
    // Clear link and node regions
    this.linkRegions = [];
    this.nodeRegions = [];
    
    // Draw color key at the top
    this.drawColorKey();
    
    const hops = path.hops;
    const hopCount = hops.length;
    
    if (hopCount === 0) return;
    
    // Calculate positions with improved layout
    const positions = this.calculateNodePositions(hops);
    
    // Find bottleneck if latency data available
    let bottleneckIndex = -1;
    if (latencyData && latencyData.breakdown) {
      let maxLatency = 0;
      latencyData.breakdown.forEach((hop, i) => {
        if (hop.latencies.total > maxLatency) {
          maxLatency = hop.latencies.total;
          bottleneckIndex = i;
        }
      });
    }
    
    // Draw links first (so they appear behind nodes)
    for (let i = 0; i < hopCount - 1; i++) {
      const pos1 = positions[i];
      const pos2 = positions[i + 1];
      
      // Get latency for color coding if available
      let linkLatency = null;
      if (latencyData && latencyData.breakdown[i]) {
        linkLatency = latencyData.breakdown[i].latencies.total;
      }
      
      this.drawLink(pos1.x, pos1.y, pos2.x, pos2.y, hops[i], linkLatency, i);
    }
    
    // Draw nodes
    for (let i = 0; i < hopCount; i++) {
      const pos = positions[i];
      const hop = hops[i];
      
      // Get latency data for this hop
      let cumulativeLatency = null;
      let hopLatency = null;
      if (latencyData && latencyData.breakdown[i]) {
        cumulativeLatency = latencyData.breakdown[i].cumulative;
        hopLatency = latencyData.breakdown[i].latencies.total;
      }
      
      const isBottleneck = (i === bottleneckIndex);
      this.drawNode(pos.x, pos.y, hop, cumulativeLatency, hopLatency, isBottleneck);
    }
    
    // Draw latency breakdown bars if data available
    if (latencyData) {
      this.drawLatencyBreakdown(latencyData, 80, 250);
    }
  }
  
  /**
   * Calculate node positions using improved layout algorithm
   */
  calculateNodePositions(hops) {
    const positions = [];
    const hopCount = hops.length;
    
    // Calculate horizontal spacing
    const startX = 80;
    const endX = this.width - 80;
    const spacing = (endX - startX) / (hopCount - 1);
    
    // Base Y position
    const baseY = 140;
    
    // Calculate positions with vertical offset for visual interest
    for (let i = 0; i < hopCount; i++) {
      const x = startX + (i * spacing);
      let y = baseY;
      
      // Add vertical offset based on hop type for better visual hierarchy
      if (hops[i].type === 'client' || hops[i].type === 'server') {
        y -= 20;  // End nodes slightly higher
      } else if (hops[i].type === 'core') {
        y += 20;  // Core routers slightly lower
      }
      
      // Round positions to whole pixels for crisp rendering
      positions.push({ 
        x: Math.round(x), 
        y: Math.round(y) 
      });
    }
    
    return positions;
  }
  
  /**
   * Draw a network node with enhanced visuals
   */
  drawNode(x, y, hop, cumulativeLatency = null, hopLatency = null, isBottleneck = false) {
    // Store node region for hover detection
    if (this.currentLatencyData && hopLatency !== null) {
      const hopIndex = this.currentPath.hops.indexOf(hop);
      const latencyData = this.currentLatencyData.breakdown[hopIndex];
      
      this.nodeRegions.push({
        x: x,
        y: y,
        hop: hop,
        isBottleneck: isBottleneck,
        latency: latencyData ? latencyData.latencies : null
      });
    } else {
      this.nodeRegions.push({
        x: x,
        y: y,
        hop: hop,
        isBottleneck: false,
        latency: null
      });
    }
    
    // Draw bottleneck indicator if needed
    if (isBottleneck) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.nodeRadius + 8, 0, Math.PI * 2);
      this.ctx.strokeStyle = '#e74c3c';
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([5, 5]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      
      // Draw warning icon
      this.ctx.fillStyle = '#e74c3c';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('⚠️', Math.round(x + this.nodeRadius), Math.round(y - this.nodeRadius));
    }
    
    // Determine node color based on latency if available
    let nodeColor;
    if (hopLatency !== null) {
      nodeColor = this.getLatencyColor(hopLatency);
    } else {
      // Default colors based on type
      const typeColors = {
        'client': '#3498db',
        'router': '#95a5a6',
        'isp-edge': '#e67e22',
        'core': '#8e44ad',
        'server': '#27ae60'
      };
      nodeColor = typeColors[hop.type] || '#95a5a6';
    }
    
    // Draw node circle with gradient effect
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, this.nodeRadius);
    gradient.addColorStop(0, this.lightenColor(nodeColor, 30));
    gradient.addColorStop(1, nodeColor);
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.nodeRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw node icon/text
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Use emoji icons for node types
    const icon = this.deviceIcons[hop.type] || '📡';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(icon, x, y);
    this.ctx.font = '14px Arial';  // Reset font
    
    // Draw hop name below
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.font = '11px Arial';
    this.ctx.textAlign = 'center';
    
    // Split long names
    const maxWidth = this.nodeSpacing - 20;
    const words = hop.name.split(' → ');
    if (words.length > 1) {
      this.ctx.fillText(words[0], x, y + this.nodeRadius + 15);
      this.ctx.fillText('→ ' + words[1], x, y + this.nodeRadius + 28);
    } else {
      this.ctx.fillText(hop.name, x, y + this.nodeRadius + 15);
    }
    
    // Draw cumulative latency if available
    if (cumulativeLatency !== null) {
      this.ctx.fillStyle = this.getLatencyColor(cumulativeLatency);
      this.ctx.font = '14px Arial';
      this.ctx.fillText(`${cumulativeLatency.toFixed(1)}ms`, x, y - this.nodeRadius - 10);
    }
  }
  
  /**
   * Draw a link between nodes
   */
  drawLink(x1, y1, x2, y2, hop, latency = null, hopIndex = -1) {
    // Store link region for click detection
    if (hopIndex >= 0) {
      this.linkRegions.push({
        x1: x1 + this.nodeRadius,
        x2: x2 - this.nodeRadius,
        y: y1,
        hop: hop,
        hopIndex: hopIndex,
        latencyData: latency
      });
    }
    
    // Calculate line thickness based on bandwidth
    const bandwidthGbps = hop.link.bandwidth / 1_000_000_000;
    const thickness = Math.min(8, 2 + Math.log10(bandwidthGbps + 1) * 2);
    
    // Determine link color based on utilization
    let linkColor;
    if (hop.link.utilization > 0.8) {
      linkColor = '#e74c3c';  // High utilization - red
    } else if (hop.link.utilization > 0.6) {
      linkColor = '#e67e22';  // Medium-high utilization - orange
    } else if (latency !== null) {
      linkColor = this.getLatencyColor(latency);
    } else {
      // Color based on medium
      const mediumColors = {
        'fiber': '#3498db',
        'copper': '#e67e22',
        'wifi': '#9b59b6',
        'satellite': '#e74c3c'
      };
      linkColor = mediumColors[hop.link.medium] || '#95a5a6';
    }
    
    // Draw the line
    this.ctx.beginPath();
    this.ctx.moveTo(x1 + this.nodeRadius, y1);
    this.ctx.lineTo(x2 - this.nodeRadius, y2);
    this.ctx.strokeStyle = linkColor;
    this.ctx.lineWidth = thickness;
    this.ctx.stroke();
    
    // Draw link info
    const midX = Math.round((x1 + x2) / 2);
    const midY = Math.round((y1 + y2) / 2);
    
    this.ctx.fillStyle = '#000000';  // Changed to black
    this.ctx.font = '14px Arial';  // Made bigger, no bold
    this.ctx.textAlign = 'center';
    
    // Show bandwidth and distance
    const bandwidth = (hop.link.bandwidth / 1_000_000).toFixed(0);
    const distance = hop.link.distance;
    
    this.ctx.fillText(`${bandwidth} Mbps`, midX, midY - 10);
    this.ctx.fillText(`${distance} km`, midX, midY + 10);
    
    // Show medium type
    this.ctx.font = '13px Arial';  // Slightly smaller for medium type
    this.ctx.fillText(`(${hop.link.medium})`, midX, midY + 25);
  }
  
  /**
   * Draw latency breakdown visualization
   */
  drawLatencyBreakdown(latencyData, startX, startY) {
    const barHeight = 30;
    const barSpacing = 10;
    const maxBarWidth = this.width - startX - 80;
    
    // Find max latency for scaling
    let maxLatency = 0;
    for (const hop of latencyData.breakdown) {
      if (hop.latencies.total > maxLatency) {
        maxLatency = hop.latencies.total;
      }
    }
    
    // Draw title
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Latency Breakdown by Hop:', startX, startY - 10);
    
    // Draw each hop's latency bar
    latencyData.breakdown.forEach((hop, index) => {
      const y = startY + (index * (barHeight + barSpacing));
      
      // Draw hop label
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`Hop ${hop.hopNumber}:`, startX - 40, y + barHeight/2 + 4);
      
      // Draw stacked bar for components
      let currentX = startX;
      const components = [
        { name: 'transmission', color: '#3498db' },
        { name: 'propagation', color: '#2ecc71' },
        { name: 'processing', color: '#f39c12' },
        { name: 'queuing', color: '#e74c3c' }
      ];
      
      components.forEach(comp => {
        const value = hop.latencies[comp.name];
        const width = (value / maxLatency) * maxBarWidth * 0.8;
        
        if (width > 0) {
          this.ctx.fillStyle = comp.color;
          this.ctx.fillRect(currentX, y, width, barHeight);
          currentX += width;
        }
      });
      
      // Draw total latency text
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${hop.latencies.total.toFixed(1)}ms`, currentX + 10, y + barHeight/2 + 4);
    });
    
    // Draw legend
    this.drawLegend(startX, startY + (latencyData.breakdown.length * (barHeight + barSpacing)) + 20);
  }
  
  /**
   * Draw color key at the top of the canvas
   */
  drawColorKey() {
    const items = [
      { name: 'Transmission', color: '#3498db', description: 'Time to push bits onto wire' },
      { name: 'Propagation', color: '#2ecc71', description: 'Signal travel time' },
      { name: 'Processing', color: '#f39c12', description: 'Router/switch processing' },
      { name: 'Queuing', color: '#e74c3c', description: 'Waiting in queue' }
    ];
    
    const x = 20;
    const y = 15;
    const boxSize = 14;
    
    // Draw background
    this.ctx.fillStyle = 'rgba(248, 249, 250, 0.95)';
    this.ctx.strokeStyle = '#dee2e6';
    this.ctx.lineWidth = 1;
    const keyWidth = this.width - 40;
    const keyHeight = 55; // Increased height for two lines
    this.ctx.fillRect(x, y, keyWidth, keyHeight);
    this.ctx.strokeRect(x, y, keyWidth, keyHeight);
    
    // Draw title
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Latency Component Colors:', x + 10, y + 20);
    
    // Store legend regions for hover detection
    this.legendRegions = [];
    
    // Draw each component (moved right to avoid overlap)
    let currentX = x + 210;
    
    items.forEach(item => {
      // Store region for hover detection
      this.legendRegions.push({
        x: currentX,
        y: y + 12,
        width: 160,
        height: boxSize + 25,
        item: item
      });
      
      // Draw color box
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(currentX, y + 12, boxSize, boxSize);
      this.ctx.strokeStyle = '#2c3e50';
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeRect(currentX, y + 12, boxSize, boxSize);
      
      // Draw label on first line
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.font = '13px Arial';
      this.ctx.fillText(item.name, currentX + boxSize + 5, y + 22);
      
      // Draw description on second line
      this.ctx.font = '11px Arial';
      this.ctx.fillStyle = '#6c757d';
      this.ctx.fillText(item.description, currentX + boxSize + 5, y + 37);
      
      currentX += 165;
    });
  }
  
  /**
   * Draw legend for latency components
   */
  drawLegend(x, y) {
    const items = [
      { name: 'Transmission', color: '#3498db', icon: '🔷' },
      { name: 'Propagation', color: '#2ecc71', icon: '🟢' },
      { name: 'Processing', color: '#f39c12', icon: '🟠' },
      { name: 'Queuing', color: '#e74c3c', icon: '🔴' }
    ];
    
    // Draw legend background
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.strokeStyle = '#dee2e6';
    this.ctx.lineWidth = 1;
    const legendWidth = 450;
    const legendHeight = 35;
    this.ctx.fillRect(x - 10, y - 5, legendWidth, legendHeight);
    this.ctx.strokeRect(x - 10, y - 5, legendWidth, legendHeight);
    
    // Draw legend title
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Latency Components:', x, y + 10);
    
    this.ctx.font = '13px Arial';
    let currentX = x + 130;
    items.forEach(item => {
      // Draw color box
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(currentX, y, 14, 14);
      
      // Draw label
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.fillText(item.name, currentX + 18, y + 11);
      
      currentX += 100;
    });
  }
  
  /**
   * Round to nearest pixel for crisp rendering
   */
  pixelAlign(value) {
    // Round to nearest integer for crisp text rendering
    return Math.round(value);
  }
  
  /**
   * Lighten a color by a percentage
   */
  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }
  
  /**
   * Get color based on latency value
   */
  getLatencyColor(latencyMs) {
    if (latencyMs < 30) return this.colors.excellent;
    if (latencyMs < 60) return this.colors.good;
    if (latencyMs < 100) return this.colors.okay;
    if (latencyMs < 200) return this.colors.poor;
    return this.colors.bad;
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    this.setupCanvas();
  }
}