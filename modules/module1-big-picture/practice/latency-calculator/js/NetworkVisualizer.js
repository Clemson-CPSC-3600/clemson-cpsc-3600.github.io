/**
 * Enhanced network visualization with packet animation and delay breakdown
 */
export class NetworkVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    this.links = [];
    this.packets = [];
    this.animationFrameId = null;
    this.delayBreakdown = null;
    
    // Visual settings
    this.colors = {
      transmission: '#e74c3c',
      propagation: '#3498db', 
      processing: '#f39c12',
      queuing: '#9b59b6',
      node: '#2c3e50',
      nodeActive: '#27ae60',
      link: '#95a5a6',
      packet: '#e67e22',
      packetTrail: 'rgba(230, 126, 34, 0.3)'
    };
    
    this.setupCanvas();
    this.bindEvents();
  }
  
  setupCanvas() {
    // Handle high DPI displays
    const rect = this.canvas.getBoundingClientRect();
    
    // Use parent container width if canvas has no dimensions (hidden)
    let width = rect.width;
    let height = rect.height;
    
    if (width === 0 || height === 0) {
      // Try to get dimensions from parent or use defaults
      const parent = this.canvas.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        width = parentRect.width || 800;
        height = 250; // Fixed height
      } else {
        width = 800;
        height = 250;
      }
      
      // Also set the canvas style dimensions
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
    }
    
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    
    // Reset context after canvas size change
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
    
    this.width = width;
    this.height = height;
    
    console.log('Canvas setup complete:', width, 'x', height, 'DPR:', dpr);
  }
  
  bindEvents() {
    // Handle canvas resize
    window.addEventListener('resize', () => this.setupCanvas());
    
    // Mouse interaction could be added later if needed
  }
  
  /**
   * Load a problem and create visualization
   */
  loadProblem(problem) {
    try {
      console.log('Loading problem into visualizer:', problem);
      
      // Re-setup canvas in case it was hidden before
      this.setupCanvas();
      console.log('Canvas dimensions:', this.width, 'x', this.height);
      
      this.clear();
      this.problem = problem;
      this.createNetwork(problem);
      this.delayBreakdown = null;
      this.currentTime = 0;
      this.draw();
      console.log('Visualization drawn with', this.nodes.length, 'nodes and', this.links.length, 'links');
    } catch (error) {
      console.error('Error loading problem visualization:', error);
      // Try to at least clear the canvas
      this.clear();
    }
  }
  
  /**
   * Create network topology from problem data
   */
  createNetwork(problem) {
    if (!problem || !problem.given || !problem.given.hops) {
      console.error('Invalid problem data for visualization', problem);
      return;
    }
    
    const hops = problem.given.hops;
    const nodeCount = hops.length + 1;
    const spacing = this.width / (nodeCount + 1);
    const y = this.height / 3;
    
    // Create nodes
    this.nodes = [];
    this.nodes.push({
      id: 'source',
      label: 'Source',
      x: spacing,
      y: y,
      radius: 30,
      color: this.colors.node
    });
    
    hops.forEach((hop, i) => {
      // Support both 'name' and 'node' properties for backward compatibility
      const hopName = hop.name || hop.node || `Hop ${i + 1}`;
      const label = hopName.split(' ')[0] || hopName.split('→')[0] || hopName;
      
      this.nodes.push({
        id: `hop-${i}`,
        label: label.trim(),
        x: spacing * (i + 2),
        y: y,
        radius: 25,
        color: this.colors.node,
        hop: hop
      });
    });
    
    // Destination is implicit (last hop connects to it)
    this.nodes.push({
      id: 'destination',
      label: 'Destination',
      x: spacing * (nodeCount),
      y: y,
      radius: 30,
      color: this.colors.node
    });
    
    // Create links
    this.links = [];
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const hop = i === 0 ? null : hops[i - 1];
      this.links.push({
        source: this.nodes[i],
        target: this.nodes[i + 1],
        hop: i < hops.length ? hops[i] : null,
        width: 3
      });
    }
  }
  
  /**
   * Show delay breakdown visualization
   */
  showDelayBreakdown(delayBreakdown) {
    // No longer showing delay breakdown
    this.draw();
  }
  
  
  /**
   * Draw the network visualization
   */
  draw() {
    if (!this.ctx || !this.width || !this.height) {
      console.warn('Canvas not properly initialized');
      return;
    }
    
    // Clear the entire canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw links
    this.links.forEach(link => {
      this.drawLink(link);
    });
    
    // Draw nodes
    this.nodes.forEach(node => {
      this.drawNode(node);
    });
    
  }
  
  /**
   * Draw a network link
   */
  drawLink(link) {
    const ctx = this.ctx;
    
    ctx.beginPath();
    ctx.moveTo(link.source.x + link.source.radius, link.source.y);
    ctx.lineTo(link.target.x - link.target.radius, link.target.y);
    ctx.strokeStyle = this.colors.link;
    ctx.lineWidth = link.width;
    ctx.stroke();
    
    // Draw link labels if hop data exists
    if (link.hop) {
      ctx.save();
      ctx.fillStyle = '#7f8c8d';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      
      const midX = (link.source.x + link.target.x) / 2;
      const midY = (link.source.y + link.target.y) / 2;
      
      // Bandwidth label
      ctx.fillText(
        this.formatBandwidth(link.hop.bandwidth),
        midX, midY - 15
      );
      
      // Distance label
      ctx.fillText(
        this.formatDistance(link.hop.distance),
        midX, midY + 25
      );
      
      ctx.restore();
    }
  }
  
  /**
   * Draw a network node
   */
  drawNode(node) {
    const ctx = this.ctx;
    
    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Node label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
  }
  
  
  
  
  /**
   * Stop any running animation
   */
  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Clear the canvas
   */
  clear() {
    this.stopAnimation();
    this.nodes = [];
    this.links = [];
    this.packets = [];
    this.delayBreakdown = null;
    if (this.ctx && this.width && this.height) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
  
  
  /**
   * Format bandwidth for display
   */
  formatBandwidth(bps) {
    if (bps >= 1e9) return `${(bps / 1e9).toFixed(1)}Gbps`;
    if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)}Mbps`;
    if (bps >= 1e3) return `${(bps / 1e3).toFixed(1)}Kbps`;
    return `${bps}bps`;
  }
  
  /**
   * Format distance for display
   */
  formatDistance(meters) {
    if (meters >= 1000000) return `${(meters / 1000000).toFixed(1)}Mm`;
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
    return `${meters.toFixed(0)}m`;
  }
}