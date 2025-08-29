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
    this.nodeRadius = 25;
    this.nodeSpacing = 150;
    this.colors = {
      excellent: '#2ecc71',  // < 30ms
      good: '#3498db',       // 30-60ms
      okay: '#f39c12',       // 60-100ms
      poor: '#e67e22',       // 100-200ms
      bad: '#e74c3c'         // > 200ms
    };
  }
  
  setupCanvas() {
    // Handle high DPI displays
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.width = rect.width;
    this.height = rect.height;
  }
  
  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Render the complete network path with latency information
   */
  renderPath(path, latencyData = null) {
    this.clear();
    
    const hops = path.hops;
    const hopCount = hops.length;
    
    // Calculate positions
    const startX = 80;
    const endX = this.width - 80;
    const spacing = (endX - startX) / (hopCount - 1);
    const y = 120; // Network diagram y position
    
    // Draw links first (so they appear behind nodes)
    for (let i = 0; i < hopCount - 1; i++) {
      const x1 = startX + (i * spacing);
      const x2 = startX + ((i + 1) * spacing);
      
      // Get latency for color coding if available
      let linkLatency = null;
      if (latencyData && latencyData.breakdown[i]) {
        linkLatency = latencyData.breakdown[i].latencies.total;
      }
      
      this.drawLink(x1, y, x2, y, hops[i], linkLatency);
    }
    
    // Draw nodes
    for (let i = 0; i < hopCount; i++) {
      const x = startX + (i * spacing);
      const hop = hops[i];
      
      // Get cumulative latency for this hop if available
      let cumulativeLatency = null;
      if (latencyData && latencyData.breakdown[i]) {
        cumulativeLatency = latencyData.breakdown[i].cumulative;
      }
      
      this.drawNode(x, y, hop, cumulativeLatency);
    }
    
    // Draw latency breakdown bars if data available
    if (latencyData) {
      this.drawLatencyBreakdown(latencyData, startX, 250);
    }
  }
  
  /**
   * Draw a network node
   */
  drawNode(x, y, hop, cumulativeLatency = null) {
    // Determine node color based on type
    const typeColors = {
      'client': '#3498db',
      'router': '#95a5a6',
      'isp-edge': '#e67e22',
      'core': '#8e44ad',
      'server': '#27ae60'
    };
    
    // Draw node circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.nodeRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = typeColors[hop.type] || '#95a5a6';
    this.ctx.fill();
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw node icon/text
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Short labels for node types
    const labels = {
      'client': 'PC',
      'router': 'R',
      'isp-edge': 'ISP',
      'core': 'Core',
      'server': 'SVR'
    };
    this.ctx.fillText(labels[hop.type] || 'R', x, y);
    
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
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillText(`${cumulativeLatency.toFixed(1)}ms`, x, y - this.nodeRadius - 10);
    }
  }
  
  /**
   * Draw a link between nodes
   */
  drawLink(x1, y1, x2, y2, hop, latency = null) {
    // Draw the line
    this.ctx.beginPath();
    this.ctx.moveTo(x1 + this.nodeRadius, y1);
    this.ctx.lineTo(x2 - this.nodeRadius, y2);
    
    // Color based on latency if available
    if (latency !== null) {
      this.ctx.strokeStyle = this.getLatencyColor(latency);
      this.ctx.lineWidth = 3;
    } else {
      this.ctx.strokeStyle = '#95a5a6';
      this.ctx.lineWidth = 2;
    }
    
    this.ctx.stroke();
    
    // Draw link info
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    this.ctx.fillStyle = '#7f8c8d';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    
    // Show bandwidth and distance
    const bandwidth = (hop.link.bandwidth / 1_000_000).toFixed(0);
    const distance = hop.link.distance;
    
    this.ctx.fillText(`${bandwidth} Mbps`, midX, midY - 10);
    this.ctx.fillText(`${distance} km`, midX, midY + 10);
    
    // Show medium type
    this.ctx.fillText(`(${hop.link.medium})`, midX, midY + 22);
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
      this.ctx.font = '12px Arial';
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
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${hop.latencies.total.toFixed(1)}ms`, currentX + 10, y + barHeight/2 + 4);
    });
    
    // Draw legend
    this.drawLegend(startX, startY + (latencyData.breakdown.length * (barHeight + barSpacing)) + 20);
  }
  
  /**
   * Draw legend for latency components
   */
  drawLegend(x, y) {
    const items = [
      { name: 'Transmission', color: '#3498db' },
      { name: 'Propagation', color: '#2ecc71' },
      { name: 'Processing', color: '#f39c12' },
      { name: 'Queuing', color: '#e74c3c' }
    ];
    
    this.ctx.font = '11px Arial';
    this.ctx.textAlign = 'left';
    
    let currentX = x;
    items.forEach(item => {
      // Draw color box
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(currentX, y, 12, 12);
      
      // Draw label
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.fillText(item.name, currentX + 16, y + 10);
      
      currentX += 100;
    });
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