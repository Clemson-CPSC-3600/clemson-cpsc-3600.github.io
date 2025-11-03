/**
 * HopBreakdownTable - Displays detailed hop-by-hop latency breakdown
 * Shows transmission, propagation, processing, and queuing delays for each hop
 */

import { NetworkFormatter } from '../../../../shared/utils/NetworkFormatter.js';
import { COLORS } from '../../../../shared/constants/colors.js';

export class HopBreakdownTable {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id '${containerId}' not found`);
    }
    
    this.expandedRows = new Set();
    this.latencyData = null;
    this.scenario = null;
    this.packetSize = 1500;
    
    this.init();
  }
  
  /**
   * Initialize the table structure
   */
  init() {
    this.container.innerHTML = `
      <div class="hop-breakdown-section">
        <h3>📊 Detailed Hop-by-Hop Breakdown</h3>
        <p class="table-hint">💡 Click any row to see detailed equations and calculations</p>
        <div class="table-wrapper">
          <table class="breakdown-table">
            <thead>
              <tr>
                <th>Hop</th>
                <th>Node</th>
                <th>Transmission</th>
                <th>Propagation</th>
                <th>Processing</th>
                <th>Queuing</th>
                <th>Total</th>
                <th>Cumulative</th>
              </tr>
            </thead>
            <tbody id="breakdown-tbody">
              <tr>
                <td colspan="8" class="no-data">No data available. Select a scenario to begin.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // Store reference to tbody
    this.tbody = this.container.querySelector('#breakdown-tbody');
  }
  
  /**
   * Update the table with new latency data
   */
  update(latencyData, scenario, packetSize = 1500) {
    this.latencyData = latencyData;
    this.scenario = scenario;
    this.packetSize = packetSize;
    
    if (!latencyData || latencyData.length === 0) {
      this.showNoData();
      return;
    }
    
    this.renderTable();
  }
  
  /**
   * Show no data message
   */
  showNoData() {
    this.tbody.innerHTML = `
      <tr>
        <td colspan="8" class="no-data">No data available. Select a scenario to begin.</td>
      </tr>
    `;
  }
  
  /**
   * Render the table with latency data
   */
  renderTable() {
    this.tbody.innerHTML = '';
    
    // Find the bottleneck (hop with highest total delay)
    let maxTotalDelay = 0;
    let bottleneckIndex = -1;
    this.latencyData.forEach((data, index) => {
      if (data.delays && data.delays.total > maxTotalDelay) {
        maxTotalDelay = data.delays.total;
        bottleneckIndex = index;
      }
    });
    
    // Render each hop
    this.latencyData.forEach((data, index) => {
      const hop = this.scenario.hops[index];
      
      // Main data row
      const row = document.createElement('tr');
      row.className = 'hop-row clickable';
      if (index === bottleneckIndex) {
        row.classList.add('bottleneck');
      }
      
      // Add expand icon and hop number
      const hopCell = document.createElement('td');
      hopCell.innerHTML = `<span class="expand-icon">${this.expandedRows.has(index) ? '▼' : '▶'}</span> ${index + 1}`;
      row.appendChild(hopCell);
      
      // Node name with type indicator
      const nodeCell = document.createElement('td');
      nodeCell.className = 'node-name';
      const nodeIcon = this.getNodeIcon(hop.nodeType);
      nodeCell.innerHTML = `${nodeIcon} ${data.node}`;
      row.appendChild(nodeCell);
      
      // Delay components
      // For the last hop, show dashes for link-related delays
      const isLastHop = data.isLastHop || false;
      if (isLastHop) {
        this.addDelayCell(row, 0, 'transmission', true);  // Show dash
        this.addDelayCell(row, 0, 'propagation', true);   // Show dash
        this.addDelayCell(row, data.delays.processing, 'processing');
        this.addDelayCell(row, 0, 'queuing', true);       // Show dash
      } else {
        this.addDelayCell(row, data.delays.transmission, 'transmission');
        this.addDelayCell(row, data.delays.propagation, 'propagation');
        this.addDelayCell(row, data.delays.processing, 'processing');
        this.addDelayCell(row, data.delays.queuing, 'queuing');
      }
      
      // Total delay
      const totalCell = document.createElement('td');
      totalCell.className = 'total-delay';
      totalCell.innerHTML = `<strong>${NetworkFormatter.time(data.delays.total)}</strong>`;
      row.appendChild(totalCell);
      
      // Cumulative delay
      const cumulativeCell = document.createElement('td');
      cumulativeCell.className = 'cumulative-delay';
      cumulativeCell.innerHTML = `<strong>${NetworkFormatter.time(data.cumulativeDelay)}</strong>`;
      cumulativeCell.style.color = this.getLatencyColor(data.cumulativeDelay);
      row.appendChild(cumulativeCell);
      
      // Add click handler
      row.addEventListener('click', () => this.toggleDetails(index));
      
      this.tbody.appendChild(row);
      
      // Details row (equations and calculations)
      const detailsRow = document.createElement('tr');
      detailsRow.className = 'details-row';
      detailsRow.id = `details-${index}`;
      detailsRow.style.display = this.expandedRows.has(index) ? 'table-row' : 'none';
      
      const detailsCell = document.createElement('td');
      detailsCell.colSpan = 8;
      detailsCell.innerHTML = this.generateDetailsHTML(hop, data, index);
      detailsRow.appendChild(detailsCell);
      
      this.tbody.appendChild(detailsRow);
    });
  }
  
  /**
   * Add a delay cell with color coding
   */
  addDelayCell(row, value, type, showDash = false) {
    const cell = document.createElement('td');
    cell.className = `delay-${type}`;
    
    if (showDash) {
      // Show dash for non-applicable delays
      cell.style.color = '#ccc';
      cell.textContent = '—';
    } else {
      // Color code based on value
      let color = '#666';
      if (value > 50) {
        color = COLORS.LATENCY.BAD;
      } else if (value > 20) {
        color = COLORS.LATENCY.POOR;
      } else if (value > 5) {
        color = COLORS.LATENCY.OKAY;
      } else if (value > 0.1) {
        color = COLORS.LATENCY.GOOD;
      }
      
      cell.style.color = color;
      cell.textContent = NetworkFormatter.time(value);
    }
    
    row.appendChild(cell);
  }
  
  /**
   * Toggle details row visibility
   */
  toggleDetails(index) {
    const detailsRow = document.getElementById(`details-${index}`);
    const hopRow = this.tbody.children[index * 2]; // Each hop has 2 rows (data + details)
    const expandIcon = hopRow.querySelector('.expand-icon');
    
    if (this.expandedRows.has(index)) {
      this.expandedRows.delete(index);
      detailsRow.style.display = 'none';
      expandIcon.textContent = '▶';
      hopRow.classList.remove('expanded');
    } else {
      this.expandedRows.add(index);
      detailsRow.style.display = 'table-row';
      expandIcon.textContent = '▼';
      hopRow.classList.add('expanded');
    }
  }
  
  /**
   * Generate detailed equations HTML
   */
  generateDetailsHTML(hop, data, index) {
    const packetSizeBits = this.packetSize * 8;
    const isLastHop = data.isLastHop || false;
    
    // Format bandwidth in bits per second for equation display
    const formatBandwidthBps = (bps) => {
      if (bps >= 1e9) return `${(bps / 1e9).toFixed(1)} Gbps`;
      if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)} Mbps`;
      if (bps >= 1e3) return `${(bps / 1e3).toFixed(1)} Kbps`;
      return `${bps} bps`;
    };
    
    // Get propagation speed based on medium
    const PROPAGATION_SPEEDS = {
      'fiber': 2e8,
      'copper': 2e8,
      'coax': 2e8,
      'wireless': 3e8,
      'wifi': 3e8,
      'satellite': 3e8,
      'air': 3e8,
      'vacuum': 3e8
    };
    
    const propagationSpeed = hop.propagationSpeed || PROPAGATION_SPEEDS[hop.medium] || 2e8;
    const speedKmPerMs = propagationSpeed / 1000000; // Convert to km/ms
    
    // Different layout for last hop (destination)
    if (isLastHop) {
      return `
        <div class="equations-container">
          <h4>📐 Delay Calculations for ${hop.node} (Destination)</h4>
          
          <div class="equations-grid">
            <!-- Processing Delay Only -->
            <div class="equation-card">
              <h5>⚙️ Processing Delay</h5>
              <div class="equation">
                <span class="formula">Fixed Processing Time</span>
                <span class="calculation">Device type: ${hop.nodeType}</span>
                <span class="result">= ${NetworkFormatter.time(data.delays.processing)}</span>
              </div>
              <p class="explanation">Static delay for ${hop.nodeType} operations (routing decisions, header examination, etc.)</p>
            </div>
            
            <div class="equation-card" style="background: #f0f0f0;">
              <h5>ℹ️ No Outgoing Link</h5>
              <p class="explanation">
                This is the destination node. There are no transmission, propagation, or queuing delays 
                since there's no outgoing link from this node.
              </p>
            </div>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="equations-container">
        <h4>📐 Delay Calculations for ${hop.node}</h4>
        
        <div class="equations-grid">
          <!-- Transmission Delay -->
          <div class="equation-card">
            <h5>🔄 Transmission Delay</h5>
            <div class="equation">
              <span class="formula">Packet Size (bits) / Bandwidth</span>
              <span class="calculation">= (${this.packetSize.toLocaleString()} bytes × 8 bits/byte) / ${formatBandwidthBps(hop.bandwidth)}</span>
              <span class="calculation">= ${packetSizeBits.toLocaleString()} bits / ${hop.bandwidth.toLocaleString()} bps</span>
              <span class="result">= ${NetworkFormatter.time(data.delays.transmission)}</span>
            </div>
            <p class="explanation">Time to serialize ${this.packetSize} bytes onto the link at ${NetworkFormatter.bandwidth(hop.bandwidth)}</p>
          </div>
          
          <!-- Propagation Delay -->
          <div class="equation-card">
            <h5>📡 Propagation Delay</h5>
            <div class="equation">
              <span class="formula">Distance / Signal Speed in ${hop.medium || 'fiber'}</span>
              <span class="calculation">= ${hop.distance.toLocaleString()} meters / ${propagationSpeed.toExponential(1)} m/s</span>
              <span class="calculation">= ${NetworkFormatter.distance(hop.distance)} / ${speedKmPerMs.toFixed(0)} km/ms</span>
              <span class="result">= ${NetworkFormatter.time(data.delays.propagation)}</span>
            </div>
            <p class="explanation">
              Signal travel time over ${NetworkFormatter.distance(hop.distance)} of ${hop.medium || 'fiber'}
              ${hop.medium === 'satellite' || hop.medium === 'wireless' || hop.medium === 'wifi' ? 
                '(at speed of light)' : '(at ~2/3 speed of light)'}
            </p>
          </div>
          
          <!-- Processing Delay -->
          <div class="equation-card">
            <h5>⚙️ Processing Delay</h5>
            <div class="equation">
              <span class="formula">Fixed Processing Time</span>
              <span class="calculation">Device type: ${hop.nodeType}</span>
              <span class="result">= ${NetworkFormatter.time(data.delays.processing)}</span>
            </div>
            <p class="explanation">
              Static delay for ${hop.nodeType} operations
              ${hop.nodeType === 'firewall' ? '(includes deep packet inspection)' : 
                hop.nodeType === 'loadbalancer' ? '(includes load distribution logic)' :
                hop.nodeType === 'server' ? '(includes application processing)' :
                '(routing decisions, header examination)'}
            </p>
          </div>
          
          <!-- Queuing Delay -->
          <div class="equation-card">
            <h5>⏳ Queuing Delay</h5>
            <div class="equation">
              <span class="formula">(1/(1-u)³) - 1 milliseconds</span>
              <span class="calculation">= (1/(1-${(hop.utilization || 0).toFixed(2)})³) - 1</span>
              <span class="calculation">Utilization u = ${Math.round((hop.utilization || 0) * 100)}%</span>
              <span class="result">= ${NetworkFormatter.time(data.delays.queuing)}</span>
            </div>
            <p class="explanation">
              ${this.getQueuingExplanation(hop.utilization || 0)}
            </p>
          </div>
        </div>
        
        <!-- Node & Link Properties -->
        <div class="link-properties">
          <h5>🔗 Node & Link Properties</h5>
          <div class="properties-grid">
            <div class="property">
              <span class="label">Node Type:</span>
              <span class="value">${hop.nodeType}</span>
            </div>
            <div class="property">
              <span class="label">Bandwidth:</span>
              <span class="value">${NetworkFormatter.bandwidth(hop.bandwidth)}</span>
            </div>
            <div class="property">
              <span class="label">Distance:</span>
              <span class="value">${NetworkFormatter.distance(hop.distance)}</span>
            </div>
            <div class="property">
              <span class="label">Medium:</span>
              <span class="value">${hop.medium || 'fiber'}</span>
            </div>
            <div class="property">
              <span class="label">Utilization:</span>
              <span class="value" style="color: ${this.getUtilizationColor(hop.utilization || 0)}">
                ${Math.round((hop.utilization || 0) * 100)}%
              </span>
            </div>
            <div class="property">
              <span class="label">Processing:</span>
              <span class="value">${NetworkFormatter.time(hop.processingDelay || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Get explanation for queuing delay
   */
  getQueuingExplanation(utilization) {
    if (utilization >= 0.9) {
      return 'Severe congestion - link near capacity!';
    } else if (utilization >= 0.7) {
      return 'High congestion - significant queuing';
    } else if (utilization >= 0.5) {
      return 'Moderate congestion - some queuing';
    } else if (utilization >= 0.3) {
      return 'Light load - minimal queuing';
    }
    return 'Low utilization - negligible queuing';
  }
  
  /**
   * Get color for utilization value
   */
  getUtilizationColor(utilization) {
    if (utilization >= 0.9) return '#e74c3c'; // Red
    if (utilization >= 0.7) return '#e67e22'; // Orange
    if (utilization >= 0.5) return '#f39c12'; // Yellow
    return '#27ae60'; // Green
  }
  
  /**
   * Get color based on latency
   */
  getLatencyColor(latency) {
    if (latency < 30) return COLORS.LATENCY.EXCELLENT;
    if (latency < 60) return COLORS.LATENCY.GOOD;
    if (latency < 100) return COLORS.LATENCY.OKAY;
    if (latency < 200) return COLORS.LATENCY.POOR;
    return COLORS.LATENCY.BAD;
  }
  
  /**
   * Get icon for node type
   */
  getNodeIcon(nodeType) {
    const icons = {
      'client': '💻',
      'router': '🔄',
      'switch': '🔀',
      'isp-edge': '🌐',
      'core': '⚡',
      'server': '🖥️',
      'firewall': '🛡️',
      'loadbalancer': '⚖️'
    };
    return icons[nodeType] || '📡';
  }
  
  /**
   * Clear the table
   */
  clear() {
    this.expandedRows.clear();
    this.showNoData();
  }
}