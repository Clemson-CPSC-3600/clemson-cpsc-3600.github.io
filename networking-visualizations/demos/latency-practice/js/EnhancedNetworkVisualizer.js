/**
 * Enhanced Network Visualizer for Latency Practice
 * Displays network topology with embedded information similar to packet journey demo
 */

import { NetworkFormatter } from '../../../shared/utils/NetworkFormatter.js';

export class EnhancedNetworkVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Visual settings matching packet journey style
    this.colors = {
      // Node colors
      client: '#3498db',
      router: '#e74c3c',
      switch: '#9b59b6',
      server: '#27ae60',
      satellite: '#f39c12',
      default: '#2c3e50',
      
      // Link colors by medium
      fiber: '#3498db',
      copper: '#e67e22',
      wireless: '#9b59b6',
      satellite: '#f39c12',
      
      // UI colors
      nodeStroke: '#2c3e50',
      nodeText: '#ffffff',
      linkText: '#2c3e50',
      background: '#f8f9fa',
      grid: '#e0e0e0',
      
      // Delay component colors
      transmission: '#e74c3c',
      propagation: '#3498db',
      processing: '#f39c12',
      queuing: '#9b59b6',
      
      // Hover/selection
      hover: 'rgba(52, 152, 219, 0.3)',
      selected: 'rgba(46, 204, 113, 0.3)'
    };
    
    // Layout settings
    this.nodeRadius = 40;
    this.linkWidth = 3;
    this.fontSize = 12;
    this.padding = 60;
    
    // State
    this.nodes = [];
    this.links = [];
    this.hoveredElement = null;
    this.selectedElement = null;
    this.tooltip = null;
    
    this.setupCanvas();
    this.bindEvents();
  }
  
  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    this.width = rect.width || 800;
    this.height = rect.height || 400;
    
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    
    this.ctx.scale(dpr, dpr);
    
    // Set default styles
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }
  
  bindEvents() {
    // Mouse move for hover effects
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleMouseMove(x, y);
    });
    
    // Click for selection
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleClick(x, y);
    });
    
    // Mouse leave to clear hover
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredElement = null;
      this.hideTooltip();
      this.draw();
    });
    
    // Resize handling
    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.draw();
    });
  }
  
  /**
   * Load problem and create network visualization
   */
  loadProblem(problem) {
    if (!problem || !problem.given) return;
    
    this.problem = problem;
    this.nodes = [];
    this.links = [];
    
    // Create nodes and links from problem data
    const hops = problem.given.hops || [];
    
    // Calculate node positions
    const nodeCount = hops.length + 1;
    const spacing = (this.width - 2 * this.padding) / Math.max(nodeCount - 1, 1);
    
    // Create source node
    let previousNode = {
      id: 'node-0',
      label: this.getNodeLabel(hops[0], 'source'),
      type: this.getNodeType(hops[0], 'source'),
      x: this.padding,
      y: this.height / 2,
      info: {
        type: 'source',
        device: hops[0]?.nodeType || 'client'
      }
    };
    this.nodes.push(previousNode);
    
    // Create nodes and links for each hop
    hops.forEach((hop, index) => {
      // Create destination node
      const node = {
        id: `node-${index + 1}`,
        label: this.getNodeLabel(hop, 'destination', index),
        type: this.getNodeType(hop, 'destination'),
        x: this.padding + spacing * (index + 1),
        y: this.height / 2,
        info: {
          type: index === hops.length - 1 ? 'destination' : 'intermediate',
          device: hop.nodeType || (index === hops.length - 1 ? 'server' : 'router')
        }
      };
      this.nodes.push(node);
      
      // Create link
      const link = {
        id: `link-${index}`,
        source: previousNode,
        target: node,
        hop: hop,
        info: {
          bandwidth: hop.bandwidth,
          distance: hop.distance,
          medium: hop.medium,
          utilization: hop.utilization || 0,
          processingDelay: hop.processingDelay,
          queuingDelay: hop.queuingDelay
        }
      };
      this.links.push(link);
      
      previousNode = node;
    });
    
    this.draw();
  }
  
  /**
   * Get node label from hop data
   */
  getNodeLabel(hop, position, index) {
    if (!hop) return 'Client';
    
    if (hop.node) {
      // Use provided node name
      const parts = hop.node.split('→');
      if (position === 'source' && parts[0]) return parts[0].trim();
      if (position === 'destination' && parts[1]) return parts[1].trim();
    }
    
    // Generate based on type
    if (position === 'source') {
      return hop.nodeType === 'client' ? 'Client' : 'Host';
    } else if (position === 'destination') {
      if (index !== undefined && this.problem?.given?.hops?.length === index + 1) {
        return 'Server';
      }
      return this.formatNodeType(hop.nodeType || 'router');
    }
    
    return `Node ${index + 1}`;
  }
  
  /**
   * Get node type for styling
   */
  getNodeType(hop, position) {
    if (!hop) return 'client';
    
    if (position === 'source') {
      return 'client';
    }
    
    if (hop.nodeType) {
      return hop.nodeType;
    }
    
    // Infer from medium
    if (hop.medium === 'satellite') return 'satellite';
    if (hop.medium === 'wireless' || hop.medium === 'wifi') return 'router';
    
    return 'router';
  }
  
  /**
   * Format node type for display
   */
  formatNodeType(type) {
    const types = {
      router: 'Router',
      switch: 'Switch',
      server: 'Server',
      client: 'Client',
      firewall: 'Firewall',
      satellite: 'Satellite',
      isp: 'ISP Router',
      core: 'Core Router'
    };
    return types[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }
  
  /**
   * Main drawing function
   */
  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background
    this.drawBackground();
    
    // Draw links
    this.links.forEach(link => this.drawLink(link));
    
    // Draw nodes
    this.nodes.forEach(node => this.drawNode(node));
    
    // Draw tooltip if needed
    if (this.tooltip) {
      this.drawTooltip();
    }
  }
  
  /**
   * Draw background grid
   */
  drawBackground() {
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Optional: Add subtle grid
    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.lineWidth = 0.5;
    this.ctx.setLineDash([5, 5]);
    
    // Vertical lines
    for (let x = 50; x < this.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 50; y < this.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    
    this.ctx.setLineDash([]);
  }
  
  /**
   * Draw a network link with embedded information
   */
  drawLink(link) {
    const { source, target, hop, info } = link;
    
    // Calculate link path
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Adjust for node radius
    const startX = source.x + Math.cos(angle) * this.nodeRadius;
    const startY = source.y + Math.sin(angle) * this.nodeRadius;
    const endX = target.x - Math.cos(angle) * this.nodeRadius;
    const endY = target.y - Math.sin(angle) * this.nodeRadius;
    
    // Draw link line
    this.ctx.strokeStyle = this.colors[hop.medium] || this.colors.default;
    this.ctx.lineWidth = this.linkWidth;
    
    if (link === this.hoveredElement || link === this.selectedElement) {
      this.ctx.lineWidth = this.linkWidth * 1.5;
      this.ctx.globalAlpha = 0.8;
    }
    
    // Draw dashed line for wireless/satellite
    if (hop.medium === 'wireless' || hop.medium === 'wifi' || hop.medium === 'satellite') {
      this.ctx.setLineDash([10, 5]);
    }
    
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.globalAlpha = 1;
    
    // Draw link information
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Calculate text rotation
    const textAngle = angle > Math.PI/2 || angle < -Math.PI/2 ? angle + Math.PI : angle;
    
    // Medium type and bandwidth above link
    this.ctx.save();
    this.ctx.translate(midX, midY - 25);
    this.ctx.rotate(textAngle);
    this.ctx.fillStyle = this.colors.linkText;
    this.ctx.font = `bold ${this.fontSize}px system-ui, -apple-system, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(`${hop.medium.toUpperCase()} - ${NetworkFormatter.bandwidth(hop.bandwidth)}`, 0, 0);
    this.ctx.restore();
    
    // Distance in the middle
    this.ctx.save();
    this.ctx.translate(midX, midY);
    this.ctx.rotate(textAngle);
    this.ctx.fillStyle = this.colors.linkText;
    this.ctx.font = `${this.fontSize}px system-ui, -apple-system, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(NetworkFormatter.distance(hop.distance), 0, 0);
    this.ctx.restore();
    
    // Utilization below link
    this.ctx.save();
    this.ctx.translate(midX, midY + 25);
    this.ctx.rotate(textAngle);
    const utilPercent = Math.round((hop.utilization || 0) * 100);
    const utilColor = hop.utilization > 0.8 ? '#e74c3c' : 
                      hop.utilization > 0.6 ? '#f39c12' : '#27ae60';
    this.ctx.fillStyle = utilColor;
    this.ctx.font = `bold ${this.fontSize}px system-ui, -apple-system, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`${utilPercent}% utilization`, 0, 0);
    this.ctx.restore();
    
    // Additional utilization indicator for very high utilization
    if (hop.utilization > 0.7) {
      this.drawUtilizationIndicator(midX, midY - 45, hop.utilization);
    }
  }
  
  /**
   * Draw utilization indicator
   */
  drawUtilizationIndicator(x, y, utilization) {
    const radius = 8;
    const color = utilization > 0.9 ? '#e74c3c' : 
                  utilization > 0.8 ? '#f39c12' : '#e67e22';
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y - 30, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Utilization percentage
    this.ctx.fillStyle = '#fff';
    this.ctx.font = `bold 10px system-ui, -apple-system, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(Math.round(utilization * 100) + '%', x, y - 30);
    
    this.ctx.restore();
  }
  
  /**
   * Draw a network node
   */
  drawNode(node) {
    const isHovered = node === this.hoveredElement;
    const isSelected = node === this.selectedElement;
    
    // Node circle
    this.ctx.fillStyle = this.colors[node.type] || this.colors.default;
    if (isHovered || isSelected) {
      this.ctx.globalAlpha = 0.8;
    }
    
    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Node border
    this.ctx.strokeStyle = this.colors.nodeStroke;
    this.ctx.lineWidth = isHovered || isSelected ? 3 : 2;
    this.ctx.stroke();
    
    this.ctx.globalAlpha = 1;
    
    // Node icon/symbol
    this.drawNodeIcon(node);
    
    // Node label
    this.ctx.fillStyle = this.colors.nodeText;
    this.ctx.font = `bold ${this.fontSize + 2}px system-ui, -apple-system, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(node.label, node.x, node.y);
    
    // Processing delay indicator (if significant)
    if (node.info && node.info.processingDelay > 0.1) {
      this.ctx.fillStyle = this.colors.processing;
      this.ctx.font = `${this.fontSize - 2}px system-ui, -apple-system, sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(
        `${node.info.processingDelay}ms`, 
        node.x, 
        node.y + this.nodeRadius + 5
      );
    }
  }
  
  /**
   * Draw node type icon
   */
  drawNodeIcon(node) {
    this.ctx.save();
    this.ctx.strokeStyle = this.colors.nodeText;
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.3;
    
    const size = 20;
    const x = node.x;
    const y = node.y - 15;
    
    switch(node.type) {
      case 'router':
        // Router icon: crosshairs
        this.ctx.beginPath();
        this.ctx.moveTo(x - size/2, y);
        this.ctx.lineTo(x + size/2, y);
        this.ctx.moveTo(x, y - size/2);
        this.ctx.lineTo(x, y + size/2);
        this.ctx.stroke();
        break;
        
      case 'switch':
        // Switch icon: horizontal lines
        for (let i = -1; i <= 1; i++) {
          this.ctx.beginPath();
          this.ctx.moveTo(x - size/2, y + i * 6);
          this.ctx.lineTo(x + size/2, y + i * 6);
          this.ctx.stroke();
        }
        break;
        
      case 'server':
        // Server icon: stacked rectangles
        this.ctx.strokeRect(x - size/2, y - 8, size, 6);
        this.ctx.strokeRect(x - size/2, y, size, 6);
        this.ctx.strokeRect(x - size/2, y + 8, size, 6);
        break;
        
      case 'satellite':
        // Satellite icon: dish
        this.ctx.beginPath();
        this.ctx.arc(x, y, size/2, Math.PI * 0.2, Math.PI * 0.8);
        this.ctx.stroke();
        break;
    }
    
    this.ctx.restore();
  }
  
  /**
   * Handle mouse movement
   */
  handleMouseMove(x, y) {
    const previousHovered = this.hoveredElement;
    this.hoveredElement = null;
    
    // Check nodes
    for (const node of this.nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= this.nodeRadius) {
        this.hoveredElement = node;
        this.showTooltip(x, y, this.getNodeTooltip(node));
        break;
      }
    }
    
    // Check links if no node is hovered
    if (!this.hoveredElement) {
      for (const link of this.links) {
        if (this.isPointNearLink(x, y, link)) {
          this.hoveredElement = link;
          this.showTooltip(x, y, this.getLinkTooltip(link));
          break;
        }
      }
    }
    
    // Hide tooltip if nothing is hovered
    if (!this.hoveredElement) {
      this.hideTooltip();
    }
    
    // Redraw if hover state changed
    if (previousHovered !== this.hoveredElement) {
      this.draw();
    }
    
    // Change cursor
    this.canvas.style.cursor = this.hoveredElement ? 'pointer' : 'default';
  }
  
  /**
   * Check if point is near a link
   */
  isPointNearLink(x, y, link) {
    const { source, target } = link;
    const threshold = 10;
    
    // Calculate distance from point to line segment
    const A = x - source.x;
    const B = y - source.y;
    const C = target.x - source.x;
    const D = target.y - source.y;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = source.x;
      yy = source.y;
    } else if (param > 1) {
      xx = target.x;
      yy = target.y;
    } else {
      xx = source.x + param * C;
      yy = source.y + param * D;
    }
    
    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy) <= threshold;
  }
  
  /**
   * Handle click events
   */
  handleClick(x, y) {
    // Toggle selection
    if (this.hoveredElement) {
      if (this.selectedElement === this.hoveredElement) {
        this.selectedElement = null;
      } else {
        this.selectedElement = this.hoveredElement;
      }
      this.draw();
    }
  }
  
  /**
   * Get node tooltip content
   */
  getNodeTooltip(node) {
    return {
      title: node.label,
      items: [
        { label: 'Type', value: this.formatNodeType(node.info.device) },
        { label: 'Position', value: node.info.type }
      ]
    };
  }
  
  /**
   * Get link tooltip content
   */
  getLinkTooltip(link) {
    const hop = link.hop;
    
    const items = [
      { label: 'Medium', value: hop.medium.toUpperCase() },
      { label: 'Bandwidth', value: NetworkFormatter.bandwidth(hop.bandwidth) },
      { label: 'Distance', value: NetworkFormatter.distance(hop.distance) },
      { label: 'Utilization', value: Math.round((hop.utilization || 0) * 100) + '%' }
    ];
    
    // Add propagation speed based on medium
    const speeds = {
      'fiber': '2×10⁸ m/s',
      'copper': '2×10⁸ m/s',
      'wireless': '3×10⁸ m/s',
      'wifi': '3×10⁸ m/s',
      'satellite': '3×10⁸ m/s'
    };
    if (speeds[hop.medium]) {
      items.push({ separator: true });
      items.push({ label: 'Prop. Speed', value: speeds[hop.medium] });
    }
    
    // Add processing delay if given
    if (hop.processingDelay !== undefined && hop.processingDelay > 0) {
      items.push({ separator: true });
      items.push({ label: 'Processing', value: `${hop.processingDelay} ms (given)` });
    }
    
    // Add queuing delay if explicitly given
    if (hop.queuingDelay !== undefined && hop.queuingDelay > 0) {
      items.push({ label: 'Queuing', value: `${hop.queuingDelay} ms (given)` });
    }
    
    return {
      title: `${link.source.label} → ${link.target.label}`,
      items: items
    };
  }
  
  /**
   * Show tooltip
   */
  showTooltip(x, y, content) {
    this.tooltip = { x, y, content };
  }
  
  /**
   * Hide tooltip
   */
  hideTooltip() {
    this.tooltip = null;
  }
  
  /**
   * Draw tooltip
   */
  drawTooltip() {
    if (!this.tooltip) return;
    
    const { x, y, content } = this.tooltip;
    const padding = 10;
    const lineHeight = 18;
    const width = 200;
    
    // Calculate height based on content
    let height = padding * 2 + lineHeight; // Title
    content.items.forEach(item => {
      height += item.separator ? 5 : lineHeight;
    });
    
    // Position tooltip (avoid edges)
    let tooltipX = x + 10;
    let tooltipY = y - height / 2;
    
    if (tooltipX + width > this.width - 10) {
      tooltipX = x - width - 10;
    }
    if (tooltipY < 10) {
      tooltipY = 10;
    }
    if (tooltipY + height > this.height - 10) {
      tooltipY = this.height - height - 10;
    }
    
    // Draw tooltip background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(tooltipX, tooltipY, width, height, 5);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw content
    let currentY = tooltipY + padding;
    
    // Title
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.font = `bold ${this.fontSize}px system-ui, -apple-system, sans-serif`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(content.title, tooltipX + padding, currentY);
    currentY += lineHeight;
    
    // Items
    this.ctx.font = `${this.fontSize - 1}px system-ui, -apple-system, sans-serif`;
    content.items.forEach(item => {
      if (item.separator) {
        // Draw separator line
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(tooltipX + padding, currentY + 2.5);
        this.ctx.lineTo(tooltipX + width - padding, currentY + 2.5);
        this.ctx.stroke();
        currentY += 5;
      } else {
        // Draw item
        this.ctx.fillStyle = item.color || '#6c757d';
        this.ctx.font = item.bold ? 
          `bold ${this.fontSize - 1}px system-ui, -apple-system, sans-serif` :
          `${this.fontSize - 1}px system-ui, -apple-system, sans-serif`;
        this.ctx.fillText(item.label + ':', tooltipX + padding, currentY);
        
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(item.value, tooltipX + width - padding, currentY);
        this.ctx.textAlign = 'left';
        
        currentY += lineHeight;
      }
    });
  }
}